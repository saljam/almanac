Elm.Almanac = Elm.Almanac || {};
Elm.Almanac.make = function (_elm) {
   "use strict";
   _elm.Almanac = _elm.Almanac || {};
   if (_elm.Almanac.values)
   return _elm.Almanac.values;
   var _N = Elm.Native,
   _U = _N.Utils.make(_elm),
   _L = _N.List.make(_elm),
   _A = _N.Array.make(_elm),
   _E = _N.Error.make(_elm),
   $moduleName = "Almanac";
   var Basics = Elm.Basics.make(_elm);
   var Color = Elm.Color.make(_elm);
   var Date = Elm.Date.make(_elm);
   var Graphics = Graphics || {};
   Graphics.Collage = Elm.Graphics.Collage.make(_elm);
   var Graphics = Graphics || {};
   Graphics.Element = Elm.Graphics.Element.make(_elm);
   var Graphics = Graphics || {};
   Graphics.Input = Elm.Graphics.Input.make(_elm);
   var Graphics = Graphics || {};
   Graphics.Input = Graphics.Input || {};
   Graphics.Input.Field = Elm.Graphics.Input.Field.make(_elm);
   var List = Elm.List.make(_elm);
   var Maybe = Elm.Maybe.make(_elm);
   var Native = Native || {};
   Native.Json = Elm.Native.Json.make(_elm);
   var Native = Native || {};
   Native.Ports = Elm.Native.Ports.make(_elm);
   var Signal = Elm.Signal.make(_elm);
   var String = Elm.String.make(_elm);
   var Text = Elm.Text.make(_elm);
   var Time = Elm.Time.make(_elm);
   var _op = {};
   var longIn = Native.Ports.portIn("longIn",
   Native.Ports.incomingSignal(function (v) {
      return typeof v === "number" ? v : _E.raise("invalid input, expecting JSNumber but got " + v);
   }));
   var phiIn = Native.Ports.portIn("phiIn",
   Native.Ports.incomingSignal(function (v) {
      return typeof v === "number" ? v : _E.raise("invalid input, expecting JSNumber but got " + v);
   }));
   var dateIn = Native.Ports.portIn("dateIn",
   Native.Ports.incomingSignal(function (v) {
      return typeof v === "string" || typeof v === "object" && v instanceof String ? v : _E.raise("invalid input, expecting JSString but got " + v);
   }));
   var radius = 120;
   var drawNum = function (n) {
      return function () {
         var r = radius + 8;
         var a = Basics.turns((0 - n) / 24 + 0.25);
         return Graphics.Collage.move({ctor: "_Tuple2"
                                      ,_0: r * Basics.cos(a)
                                      ,_1: r * Basics.sin(a)})(Graphics.Collage.toForm(Text.plainText(String.show(n))));
      }();
   };
   var hand = F3(function (clr,
   len,
   time) {
      return function () {
         var angle = Basics.degrees(90 - 6 * Time.inSeconds(time));
         return Graphics.Collage.traced(Graphics.Collage.solid(clr))(A2(Graphics.Collage.segment,
         {ctor: "_Tuple2",_0: 0,_1: 0},
         {ctor: "_Tuple2"
         ,_0: len * Basics.cos(angle)
         ,_1: len * Basics.sin(angle)}));
      }();
   });
   var marker = F3(function (clr,
   len,
   angle) {
      return function () {
         var r = Basics.degrees(0 - angle + 90);
         return Graphics.Collage.traced(Graphics.Collage.dotted(clr))(A2(Graphics.Collage.segment,
         {ctor: "_Tuple2",_0: 0,_1: 0},
         {ctor: "_Tuple2"
         ,_0: len * Basics.cos(r)
         ,_1: len * Basics.sin(r)}));
      }();
   });
   var obl = function (t) {
      return 23.4393 - 1.3e-2 * t;
   };
   var g = function (t) {
      return 357.528 + 35999.05 * t;
   };
   var l = function (t) {
      return 280.46 + 36000.77 * t;
   };
   var dcos = function ($) {
      return Basics.cos(Basics.degrees($));
   };
   var dsin = function ($) {
      return Basics.sin(Basics.degrees($));
   };
   var ec = function (t) {
      return 1.915 * dsin(g(t)) + 2.0e-2 * dsin(2 * g(t));
   };
   var lambda = function (t) {
      return l(t) + ec(t);
   };
   var delta = function (t) {
      return Basics.asin(dsin(obl(t)) * dsin(lambda(t))) * 180 / Basics.pi;
   };
   var e = function (t) {
      return 0 - ec(t) + 2.466 * dsin(2 * lambda(t)) - 5.3e-2 * dsin(4 * lambda(t));
   };
   var gha = F2(function (t,ut) {
      return ut - 180 + e(t);
   });
   var sunEqn = F6(function (ut,
   h,
   dir,
   date,
   phi,
   $long) {
      return function () {
         var t = (date + ut / 360) / 36525;
         var cosc = (dsin(h) - dsin(phi) * dsin(delta(t))) / (dcos(phi) * dcos(delta(t)));
         var correction = _U.cmp(cosc,
         1) > 0 ? 0 : _U.cmp(cosc,
         -1) < 0 ? 180 : dir * Basics.acos(cosc) * 180 / Basics.pi;
         var ut$ = ut - ($long + A2(gha,
         t,
         ut) + correction);
         return _U.cmp(Basics.abs(ut - ut$),
         1.0e-2) < 0 ? ut$ : A6(sunEqn,
         ut$,
         h,
         dir,
         date,
         phi,
         $long);
      }();
   });
   var j2000 = 2451545;
   var julian = function (d) {
      return function () {
         var y = _U.eq(Date.month(d),
         Date.Jan) || _U.eq(Date.month(d),
         Date.Feb) ? Date.year(d) + 4800 - 1 : Date.year(d) + 4800;
         var m = function () {
            var _v0 = Date.month(d);
            switch (_v0.ctor)
            {case "Apr": return 1;
               case "Aug": return 5;
               case "Dec": return 9;
               case "Feb": return 11;
               case "Jan": return 10;
               case "Jul": return 4;
               case "Jun": return 3;
               case "Mar": return 0;
               case "May": return 2;
               case "Nov": return 8;
               case "Oct": return 7;
               case "Sep": return 6;}
            _E.Case($moduleName,
            "between lines 12 and 25");
         }();
         return Date.day(d) + A2(Basics.div,
         153 * m + 2,
         5) + 365 * y + A2(Basics.div,
         y,
         4) - A2(Basics.div,
         y,
         100) + A2(Basics.div,
         y,
         400) - 32045;
      }();
   };
   var doSunEqn = F3(function (dir,
   h,
   date) {
      return function () {
         var middayEstimate = 180;
         return A3(sunEqn,
         middayEstimate,
         h,
         dir)(Basics.toFloat(julian(date) - j2000));
      }();
   });
   var sunrise = A2(doSunEqn,
   1,
   -0.833);
   var astroDown = A2(doSunEqn,
   1,
   -18);
   var nauticalDown = A2(doSunEqn,
   1,
   -12);
   var civilDown = A2(doSunEqn,
   1,
   -6);
   var sunset = A2(doSunEqn,
   -1,
   -0.833);
   var astroDusk = A2(doSunEqn,
   -1,
   -18);
   var nauticalDusk = A2(doSunEqn,
   -1,
   -12);
   var civilDusk = A2(doSunEqn,
   -1,
   -6);
   var clock = F4(function (time,
   phi,
   $long,
   date) {
      return function () {
         var at = function (f) {
            return A3(f,date,phi,$long);
         };
         return A2(Graphics.Collage.collage,
         400,
         400)(_L.append(_L.fromArray([A2(Graphics.Collage.filled,
                                     Color.lightGrey,
                                     Graphics.Collage.circle(radius))
                                     ,A2(Graphics.Collage.outlined,
                                     Graphics.Collage.solid(Color.grey),
                                     Graphics.Collage.circle(radius))
                                     ,A2(marker,
                                     Color.grey,
                                     radius)(at(civilDown))
                                     ,A2(marker,
                                     Color.grey,
                                     radius)(at(nauticalDown))
                                     ,A2(marker,
                                     Color.orange,
                                     radius)(at(sunrise))
                                     ,A2(marker,
                                     Color.charcoal,
                                     radius)(at(astroDown))
                                     ,A2(marker,
                                     Color.grey,
                                     radius)(at(nauticalDusk))
                                     ,A2(marker,
                                     Color.grey,
                                     radius)(at(civilDusk))
                                     ,A2(marker,
                                     Color.orange,
                                     radius)(at(sunset))
                                     ,A2(marker,
                                     Color.charcoal,
                                     radius)(at(astroDusk))
                                     ,A2(marker,
                                     Color.lightOrange,
                                     radius)((at(sunset) + at(sunrise)) / 2)
                                     ,A3(hand,Color.orange,100,time)
                                     ,A3(hand,
                                     Color.charcoal,
                                     100,
                                     time / 60)
                                     ,A3(hand,
                                     Color.charcoal,
                                     60,
                                     time / 1440)]),
         A2(List.map,
         drawNum,
         _L.range(0,23))));
      }();
   });
   var scene = F4(function (date,
   phi,
   $long,
   time) {
      return A3(Maybe.maybe,
      Text.plainText("oops, bad input"),
      A3(clock,time,phi,$long),
      Date.read(date));
   });
   var main = A2(Signal._op["~"],
   A2(Signal._op["~"],
   A2(Signal._op["~"],
   A2(Signal._op["<~"],
   scene,
   dateIn),
   phiIn),
   longIn),
   Time.every(Time.second));
   _elm.Almanac.values = {_op: _op
                         ,julian: julian
                         ,j2000: j2000
                         ,dsin: dsin
                         ,dcos: dcos
                         ,l: l
                         ,g: g
                         ,ec: ec
                         ,lambda: lambda
                         ,obl: obl
                         ,delta: delta
                         ,e: e
                         ,gha: gha
                         ,sunEqn: sunEqn
                         ,doSunEqn: doSunEqn
                         ,sunrise: sunrise
                         ,astroDown: astroDown
                         ,nauticalDown: nauticalDown
                         ,civilDown: civilDown
                         ,sunset: sunset
                         ,astroDusk: astroDusk
                         ,nauticalDusk: nauticalDusk
                         ,civilDusk: civilDusk
                         ,marker: marker
                         ,hand: hand
                         ,radius: radius
                         ,drawNum: drawNum
                         ,clock: clock
                         ,scene: scene
                         ,main: main};
   return _elm.Almanac.values;
};