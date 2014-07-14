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
   var tzOffsetIn = Native.Ports.portIn("tzOffsetIn",
   Native.Ports.incomingSignal(function (v) {
      return typeof v === "number" ? v : _E.raise("invalid input, expecting JSNumber but got " + v);
   }));
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
   var timeAt = function (angle) {
      return function () {
         var h = angle * 24 / 360;
         return String.show(Basics.floor(h));
      }();
   };
   var radius = 150;
   var drawNum = function (n) {
      return function () {
         var r = radius + 8;
         var a = Basics.turns((0 - n) / 24 + 0.25);
         return Graphics.Collage.move({ctor: "_Tuple2"
                                      ,_0: r * Basics.cos(a)
                                      ,_1: r * Basics.sin(a)})(Graphics.Collage.toForm(Text.plainText(String.show(n))));
      }();
   };
   var pieSlice = F4(function (colr,
   radius,
   start,
   end) {
      return function () {
         var angle = _U.cmp(end,
         start) < 0 ? end + 360 : end;
         var a = 4 * angle - 4 * start;
         var o = 0 - start + 90;
         var makePoint = function (t) {
            return Basics.fromPolar({ctor: "_Tuple2"
                                    ,_0: radius
                                    ,_1: Basics.degrees(o - t / 4)});
         };
         return Graphics.Collage.filled(colr)(Graphics.Collage.polygon({ctor: "::"
                                                                       ,_0: {ctor: "_Tuple2"
                                                                            ,_0: 0
                                                                            ,_1: 0}
                                                                       ,_1: A2(List.map,
                                                                       makePoint,
                                                                       _L.range(0,
                                                                       a))}));
      }();
   });
   var arrow = F5(function (clr,
   len,
   angle,
   angle2,
   len2) {
      return function () {
         var r2 = Basics.degrees(angle2);
         var r = Basics.degrees(90 - 6 * angle);
         var orig = {ctor: "_Tuple2"
                    ,_0: len * Basics.cos(r)
                    ,_1: len * Basics.sin(r)};
         var d1 = {ctor: "_Tuple2"
                  ,_0: (len + len2) * Basics.cos(r + r2)
                  ,_1: (len + len2) * Basics.sin(r + r2)};
         var d2 = {ctor: "_Tuple2"
                  ,_0: (len + len2) * Basics.cos(r - r2)
                  ,_1: (len + len2) * Basics.sin(r - r2)};
         return Graphics.Collage.filled(clr)(Graphics.Collage.polygon(_L.fromArray([orig
                                                                                   ,d1
                                                                                   ,d2])));
      }();
   });
   var hand = F3(function (colr,
   len,
   time) {
      return function () {
         var angle = Basics.degrees(90 - 6 * Time.inSeconds(time));
         return Graphics.Collage.traced(Graphics.Collage.solid(colr))(A2(Graphics.Collage.segment,
         {ctor: "_Tuple2",_0: 0,_1: 0},
         {ctor: "_Tuple2"
         ,_0: len * Basics.cos(angle)
         ,_1: len * Basics.sin(angle)}));
      }();
   });
   var label = F3(function (len,
   angle,
   text) {
      return function () {
         var r = Basics.degrees(90 - angle);
         return Graphics.Collage.move({ctor: "_Tuple2"
                                      ,_0: len * Basics.cos(r)
                                      ,_1: len * Basics.sin(r)})(Graphics.Collage.toForm(Text.plainText(text)));
      }();
   });
   var marker = F3(function (clr,
   len,
   angle) {
      return function () {
         var r = Basics.degrees(90 - angle);
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
   var clock = F5(function (time,
   tzAngle,
   phi,
   $long,
   date) {
      return function () {
         var civilDusk = tzAngle + A5(doSunEqn,
         -1,
         -6,
         date,
         phi,
         $long);
         var nauticalDusk = tzAngle + A5(doSunEqn,
         -1,
         -12,
         date,
         phi,
         $long);
         var astroDusk = tzAngle + A5(doSunEqn,
         -1,
         -18,
         date,
         phi,
         $long);
         var sunset = tzAngle + A5(doSunEqn,
         -1,
         -0.833,
         date,
         phi,
         $long);
         var civilDown = tzAngle + A5(doSunEqn,
         1,
         -6,
         date,
         phi,
         $long);
         var nauticalDown = tzAngle + A5(doSunEqn,
         1,
         -12,
         date,
         phi,
         $long);
         var astroDown = tzAngle + A5(doSunEqn,
         1,
         -18,
         date,
         phi,
         $long);
         var sunrise = tzAngle + A5(doSunEqn,
         1,
         -0.833,
         date,
         phi,
         $long);
         var noon = (sunset + sunrise) / 2;
         return A2(Graphics.Collage.collage,
         400,
         400)(_L.append(_L.fromArray([A2(Graphics.Collage.filled,
                                     A3(Color.rgb,18,62,124),
                                     Graphics.Collage.circle(radius))
                                     ,A2(Graphics.Collage.outlined,
                                     Graphics.Collage.solid(Color.grey),
                                     Graphics.Collage.circle(radius))
                                     ,A4(pieSlice,
                                     A3(Color.rgb,86,137,202),
                                     radius,
                                     astroDown,
                                     sunrise)
                                     ,A4(pieSlice,
                                     A3(Color.rgb,86,137,202),
                                     radius,
                                     sunset,
                                     astroDusk)
                                     ,A4(pieSlice,
                                     A3(Color.rgb,218,237,245),
                                     radius,
                                     sunrise,
                                     sunset)
                                     ,A3(marker,
                                     Color.grey,
                                     radius,
                                     civilDown)
                                     ,A3(marker,
                                     Color.grey,
                                     radius,
                                     nauticalDown)
                                     ,A3(marker,
                                     Color.orange,
                                     radius,
                                     sunrise)
                                     ,A3(marker,
                                     Color.charcoal,
                                     radius,
                                     astroDown)
                                     ,A3(marker,
                                     Color.grey,
                                     radius,
                                     nauticalDusk)
                                     ,A3(marker,
                                     Color.grey,
                                     radius,
                                     civilDusk)
                                     ,A3(marker,
                                     Color.orange,
                                     radius,
                                     sunset)
                                     ,A3(marker,
                                     Color.charcoal,
                                     radius,
                                     astroDusk)
                                     ,A2(marker,
                                     Color.lightOrange,
                                     radius)(noon)
                                     ,A2(label,
                                     radius,
                                     sunset)(_L.append("sunset ",
                                     timeAt(sunset)))
                                     ,A2(label,
                                     radius,
                                     sunrise)(_L.append("sunrise ",
                                     timeAt(sunrise)))
                                     ,A2(label,
                                     radius,
                                     noon)(_L.append("noon ",
                                     timeAt(noon)))
                                     ,A2(label,
                                     radius,
                                     astroDusk)(_L.append("dusk ",
                                     timeAt(astroDusk)))
                                     ,A2(label,
                                     radius,
                                     astroDown)(_L.append("down ",
                                     timeAt(astroDown)))
                                     ,A5(arrow,
                                     A3(Color.rgb,86,137,202),
                                     radius,
                                     time / 1440,
                                     3,
                                     30)]),
         A2(List.map,
         drawNum,
         _L.range(0,23))));
      }();
   });
   var scene = F5(function (date,
   phi,
   $long,
   tz,
   time) {
      return A3(Maybe.maybe,
      Text.plainText("oops, bad input"),
      A4(clock,
      Time.inSeconds(time) + Basics.toFloat(tz),
      360 * Basics.toFloat(tz) / (24 * 60 * 60),
      phi,
      $long),
      Date.read(date));
   });
   var main = A2(Signal._op["~"],
   A2(Signal._op["~"],
   A2(Signal._op["~"],
   A2(Signal._op["~"],
   A2(Signal._op["<~"],
   scene,
   dateIn),
   phiIn),
   longIn),
   tzOffsetIn),
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
                         ,marker: marker
                         ,label: label
                         ,hand: hand
                         ,arrow: arrow
                         ,pieSlice: pieSlice
                         ,radius: radius
                         ,drawNum: drawNum
                         ,timeAt: timeAt
                         ,clock: clock
                         ,scene: scene
                         ,main: main};
   return _elm.Almanac.values;
};