var map;
// Create a new blank array for all the listing markers.
var markers = [];

function initMap() {
  console.log("Initiating the map")
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.7413549, lng: -73.9980244},
    zoom: 13
  });
}

/**
 * Error callback for GMap API request
 */
mapError = () => {
  console.log("Executing mapError")
  var errorPage = document.getElementById("errorPage");
  console.log("The display is: " + errorPage)
  errorPage.style.display = 'unset';
};


// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {

   if (marker.getAnimation() !== null) {
     marker.setAnimation(null);
   } else {
     setTimeout(function(){ marker.setAnimation(null); }, 1400);
     marker.setAnimation(google.maps.Animation.BOUNCE);
   }

  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    // Call the NYT API
    nytApi(marker.title, infowindow)
    infowindow.open(map, marker);
    infowindow.addListener('closeclick',function(){
      infowindow.setMarker = null;
    });
  }
}

// NYT API
function nytApi(location, placeholder) {
  var $nytRequest = $.getJSON( "https://api.nytimes.com/svc/search/v2/articlesearch.json",
  {
    'api-key': "cabc7dfd34754db38a0c723b7291cf43",
    'q': location
  },
  function( data ) {
    var items = [];
    var response = data.response.docs;
    $.each(response, function(key, val) {
        items.push(". Top News (from the NY Times): <a href='" + val.web_url + "'target='_blank'>" + val.headline.main + "</a>");
    });
    placeholder.setContent("<div>" + location + items[1] + "</div>")
  });
  // Handle failures
  $nytRequest.fail(function() {
    placeholder.setContent("<div>" + location + "</div>")
  });
}



//ViewModel begins here

function ViewModel() {
  var self = this;

  // These are the cultural institutions that will be shown to the user.
  var locations = [
    {title: 'Museum of Modern Art', location: {lat: 40.761433, lng: -73.977622}},
    {title: 'The Met', location: {lat: 40.779437, lng: -73.963244}},
    {title: 'American Museum of Natural History', location: {lat: 40.781324, lng: -73.973988}},
    {title: 'Lincoln Center', location: {lat: 40.772464, lng: -73.983489}},
    {title: 'The Guggenheim', location: {lat: 40.782980, lng: -73.958971}},
  ];

  var largeInfowindow = new google.maps.InfoWindow();
  var bounds = new google.maps.LatLngBounds();


  // The following group uses the location array to create an array of markers on initialize.
  for (var i = 0; i < locations.length; i++) {
    // Get the position from the location array.
    var position = locations[i].location;
    var title = locations[i].title;
    // Create a marker per location, and put into markers array.
    var marker = new google.maps.Marker({
      map: map,
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      id: i,
    });
    // Push the marker to our array of markers.
    console.log("Adding markers to array")
    markers.push(marker);
    // Create an onclick event to open an infowindow at each marker.
    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow);
    });
    bounds.extend(markers[i].position);
  }
  // Extend the boundaries of the map for each marker
  map.fitBounds(bounds);

  // Add all markers to an observable array with a function
  // for calling populateInfoWindow on each item
  self.properties = ko.observableArray(markers);

  self.openInfoWindow = function() {
    populateInfoWindow(this, largeInfowindow)
  };

  self.query = ko.observable('');

  for(var i in self.properties()) {
    self.properties()[i].showItem = ko.observable(true)
  }

  // Filter list results
  self.search = function(value){
    for(var i in self.properties()) {
      var property = self.properties()[i]
      console.log(self.title)
      if(property.title.toLowerCase().indexOf(value.toLowerCase()) > -1) {
        property.showItem(true)
      } else {
        property.showItem(false)
      }
    }
    for(var i in markers) {
      if(markers[i].title.toLowerCase().indexOf(value.toLowerCase()) > -1) {
        markers[i].setVisible(true)
      } else {
        markers[i].setVisible(false)
      }
    }
  }
  self.query.subscribe(self.search);
};

// Call view model
window.onload = function() {
  ko.applyBindings(new ViewModel());
};
