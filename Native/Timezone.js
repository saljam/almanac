Elm.Native = Elm.Native || {};
Elm.Native.Timezone = Elm.Native.Timezone || {};

Elm.Native.Timezone.make = function(localRuntime) {
    'use strict';

    localRuntime.Native = localRuntime.Native || {};
    localRuntime.Native.Timezone = localRuntime.Native.Timezone || {};
    if ('values' in localRuntime.Native.Timezone) {
        return localRuntime.Native.Timezone.values;
    }
	
    return localRuntime.Native.Timezone.values = {
        latlong: F2( latlong.lookup ),
        offset: F2( function (date, tz) { return moment.tz(date, tz)._offset; } )
    };
};
