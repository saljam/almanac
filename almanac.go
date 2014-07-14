package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/bradfitz/latlong"
)

var (
	addr     = flag.String("addr", ":8004", "http address to listen on")
	dataRoot = flag.String("data",
		strings.Split(os.Getenv("GOPATH"), ":")[0]+"/src/github.com/saljam/almanac",
		"data dir")
)

// handleTzOffset respondes with the difference in seconds between UTC and
// the timezone at the given coordinate, at the given time.
func handleTzOffset(w http.ResponseWriter, r *http.Request) {
	r.ParseForm()
	lat, err := strconv.ParseFloat(r.Form.Get("lat"), 64)
	if err != nil {
		http.Error(w, "couldn't parse lat", http.StatusBadRequest)
		return
	}

	long, err := strconv.ParseFloat(r.Form.Get("long"), 64)
	if err != nil {
		http.Error(w, "couldn't parse long", http.StatusBadRequest)
		return
	}

	utime, err := strconv.ParseInt(r.Form.Get("time"), 10, 64)
	if err != nil {
		http.Error(w, "couldn't parse time", http.StatusBadRequest)
		return
	}

	loc, err := time.LoadLocation(latlong.LookupZoneName(lat, long))
	if err != nil {
		http.Error(w, "couldn't find timezone. bad coordinates?", http.StatusBadRequest)
		return
	}

	_, diff := time.Unix(utime, 0).In(loc).Zone()

	fmt.Fprintf(w, "%d", diff)
}

// handleTz respondes with the timezone name for the given coordinates
func handleTz(w http.ResponseWriter, r *http.Request) {
	r.ParseForm()
	lat, err := strconv.ParseFloat(r.Form.Get("lat"), 64)
	if err != nil {
		http.Error(w, "couldn't parse lat", http.StatusBadRequest)
		return
	}

	long, err := strconv.ParseFloat(r.Form.Get("long"), 64)
	if err != nil {
		http.Error(w, "couldn't parse long", http.StatusBadRequest)
		return
	}

	tz := latlong.LookupZoneName(lat, long)
	if tz == "" {
		http.Error(w, "couldn't find timezone. bad coordinates?", http.StatusBadRequest)
		return
	}

	fmt.Fprintf(w, "%s", tz)
}

func main() {
	flag.Parse()
	http.HandleFunc("/timezone", handleTz)
	http.HandleFunc("/zoneoffset", handleTzOffset)
	http.Handle("/", http.FileServer(http.Dir(*dataRoot)))

	log.Fatal(http.ListenAndServe(*addr, nil))
}
