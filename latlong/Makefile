leafs.dat: gen_test.go latlong.go world/tz_world.shp
	go test --tags=latlong_gen --generate -v

tz_world.zip:
	curl -O http://efele.net/maps/tz/world/tz_world.zip

world/tz_world.shp: tz_world.zip
	unzip tz_world.zip
