// This isn't necessary but it keeps the editor from thinking L is a typo
/* global L */

var map = L.map('map').setView([48.8541, 2.3488], 12);

// We define the GeoJSON layer here so we can access it multiple times later on.
// If we wanted to 
var cinemaLayer = L.geoJson(null, {
  pointToLayer: function (geoJsonPoint, latlng) {
    return L.circleMarker(latlng);
  },
  style: function (geoJsonFeature) {
    return {
      fillColor: '#c88d75',
      radius: 6,
      fillOpacity: 0.7,
      stroke: false,
    };
  }
}).addTo(map);

// Add base layer
L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', {
  maxZoom: 18
}).addTo(map);

function loadData() {
  // First clear the data from our GeoJSON layer
  cinemaLayer.clearLayers();
  
  fetch('https://cdn.glitch.com/5a3e6a91-11d3-4048-bd1d-4d4f9515dca3%2Fcinemas-a-paris.geojson?1537641530006')
    .then(function (response) {
      // Read data as JSON
      return response.json();
    })
    .then(function (data) {
      // Add data to the layer
      cinemaLayer.addData(data);
   
      // Add popups to the layer
      cinemaLayer.bindPopup(function (layer) {
        // This function is called whenever a feature on the layer is clicked
      
        // Uncomment this to see all properties on the clicked feature:
        console.log(layer.feature.properties);
        return layer.feature.properties['nom_etablissement'] + ', ' + layer.feature.properties['arrondissement'];
      });
    });
}

loadData();

function getCheckedCinemaSizes() {
  var preferredSizes = [];
  
  // Look at each cinemaCheckbox
  cinemaCheckboxes.forEach(function(cinemaCheckbox) {
    // If it is checked...
    if (cinemaCheckbox.checked) {
      // ...add its size value to the array of preferredSizes
      preferredSizes.push(cinemaCheckbox.dataset.screens);
    }
  });
  
  // Return the preferredSized so we can filter on them
  return preferredSizes;
}

// Filter by preferred cinema size without making another API request
function filterDataByPreferredCinemaSizes(preferredSizes) {
  // layer.eachLayer() is exactly like forEach() but is specific to Leaflet
  cinemaLayer.eachLayer(function (layer) {
    // console.log(layer.feature.properties.ecrans);
    // If preferredSizes contains this layer's number of screens...
    if (preferredSizes.indexOf("few") >= 0 && layer.feature.properties.ecrans <= 5) {
      // ...add it to the map. Otherwise...
      layer.addTo(map);
    }
    else if (preferredSizes.indexOf("many") >= 0 && layer.feature.properties.ecrans > 5) {
      layer.addTo(map);
    }
    else {
      // ...remove it from the map.
      layer.removeFrom(map);
    }
  });
}

// Select all of the cinemaCheckboxes
var cinemaCheckboxes = document.querySelectorAll('.cinema-size-checkbox');

// Add an event listener to each cinemaCheckbox
cinemaCheckboxes.forEach(function (cinemaCheckbox) {
  cinemaCheckbox.addEventListener('change', function () {
    filterDataByPreferredCinemaSizes(getCheckedCinemaSizes());
  });
});
