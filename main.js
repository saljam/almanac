(function() {
	// Init map and clock.
	var lat = 51.51, long = 0.0,
	    clock = Elm.fullscreen(Elm.Almanac, { latIn: lat, longIn: long}),
	    map = L.mapbox.map('map','saljam.iop97588').setView([lat, long], 6),
	    marker = new L.marker([lat, long], {draggable:'true'}),
	    updateloc = function(loc, mark) {
		clock.ports.latIn.send(loc.lat);
		clock.ports.longIn.send(loc.lng);
		if (mark) {
			marker.setLatLng(loc, {draggable:'true'});
			map.setView(loc);
		}
	    };

	map.addLayer(marker);
	marker.on('drag', function() { updateloc(marker.getLatLng(), false); });
	map.on('click', function(e) { updateloc(e.latlng, true); });

	// Init the date to today's.
	date.value = (new Date()).toISOString().slice(0, 10); // len("yyyy-mm-dd") == 10
	date.dispatchEvent(new Event("input"));

	// Fetch local coordinates.
	if ("geolocation" in navigator) {
		navigator.geolocation.getCurrentPosition(function(pos) {
			updateloc({lat: pos.coords.latitude, lng: pos.coords.longitude}, true);
		});
	}
}());
