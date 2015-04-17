leafs.dat: gen.go latlong.go world/tz_world.shp
	go run gen.go latlong.go

world/tz_world.shp: tz_world.zip
	unzip tz_world.zip

tz_world.zip:
	curl -LO http://efele.net/maps/tz/world/tz_world.zip

