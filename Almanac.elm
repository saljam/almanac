module Almanac where

import List
import Date
import Graphics.Input (Input, input)
import Graphics.Input.Field as Field
import Graphics.Element as Element

-- gregorian -> julian day
julian d =
  let
    m = case Date.month d of
          Date.Jan -> 10
          Date.Feb -> 11
          Date.Mar -> 0
          Date.Apr -> 1
          Date.May -> 2
          Date.Jun -> 3
          Date.Jul -> 4
          Date.Aug -> 5
          Date.Sep -> 6
          Date.Oct -> 7
          Date.Nov -> 8
          Date.Dec -> 9
    y = if Date.month d == Date.Jan || Date.month d == Date.Feb then
          Date.year d + 4800 - 1
        else
          Date.year d + 4800
  in
    Date.day d + div (153*m + 2) 5 + 365 * y + div y 4 - div y 100 + div y 400 - 32045

j2000 = 2451545 -- the julian day for J2000

-- SO MANY MAGIC NUMBERS!
-- Mostly from http://www.stargazing.net/kepler/sunrise.html# and 
-- http://en.wikipedia.org/wiki/Sunrise_equation

dsin = sin . degrees
dcos = cos . degrees

-- mean longitude
l t = 280.460 + (36000.770 * t)
-- mean anamoly
g t = 357.528 + (35999.050 * t)
-- eq centre correction
ec t = 1.915 * dsin(g t) + 0.020 * dsin(2*(g t))
-- ecliptic longitude of sun
lambda t = (l t) + (ec t)
-- tilt of earth's axis
obl t = 23.4393 - 0.0130 * t
-- sun's declination
delta t = asin(dsin(obl t) * (dsin(lambda t))) *180/pi
e t = -(ec t) + 2.466 * (dsin (2*(lambda t))) - 0.053 * (dsin(4*(lambda t)))
-- greenwhich hour angle of the sun
gha t ut = ut - 180 + e t

sunEqn ut h dir date phi long =
  let
    t = (date + ut/360)/36525 -- the number of centuries since J2000
    cosc = (dsin(h) - dsin(phi) * dsin(delta t)) / (dcos(phi) * dcos(delta t))
    correction = if | cosc > 1  -> 0
                    | cosc < -1 -> 180
                    | otherwise -> dir * acos(cosc) * 180/pi
    ut' = ut - (long + gha t ut  +  correction)
  in
    if abs (ut - ut') < 0.01 then ut' else sunEqn ut' h dir date phi long

doSunEqn dir h date =
   let
      middayEstimate = 180
   in
     sunEqn middayEstimate h dir <| toFloat (julian date - j2000)

marker clr len angle =
  let
    r = degrees <| 90 - angle
  in
    traced (dotted clr) <| segment (0,0) (len * cos r, len * sin r)

label len angle text =
  let
    a = degrees <| 90 - angle
    ra = if angle < 180 then a else degrees 180 + a
    l = len + 40
  in
    rotate ra <| move (l * cos a, l * sin a) <| toForm <| plainText text

hand colr len time =
  let angle = degrees (90 - 6 * inSeconds time)
  in  traced (solid colr) <| segment (0,0) (len * cos angle, len * sin angle)
  
arrow clr len angle angle2 len2 =
  let 
    r = turns (0.25 - angle)
    r2 = degrees <|  angle2
    orig = (len * cos r, len * sin r)
    d1 = ((len+len2)*cos (r+r2),(len+len2)*sin(r+r2))
    d2 = ((len+len2)*cos (r-r2),(len+len2)*sin(r-r2))
  in
    filled (clr) <| polygon [orig,d1,d2]

pieSlice colr radius start end =
    let
      o = -start + 90
      angle = if end < start then end + 360 else end
      a = 4*angle - 4*start
      makePoint t = fromPolar (radius, degrees (o - t/4))
    in filled colr . polygon <| (0,0) :: map makePoint[ 0 .. a ]

radius = 150
drawNum n =
  let
    a = turns <| -n/24 + 0.25
    r = radius + 8
  in
    move (r * cos a, r * sin a) <| toForm <| plainText <| show n

timeAt angle =
  let
    h = angle * 24 / 360
    m = (h - toFloat (floor h)) * 60
  in show (floor h) ++ ":" ++ show (floor m)

clock time tzAngle phi long date =
  let
    sunrise = tzAngle + doSunEqn 1 -0.833 date phi long
    astroDown = tzAngle + doSunEqn 1 -18 date phi long
    nauticalDown = tzAngle + doSunEqn 1 -12 date phi long
    civilDown = tzAngle + doSunEqn 1 -6 date phi long
    sunset = tzAngle + doSunEqn -1 -0.833 date phi long
    astroDusk = tzAngle + doSunEqn -1 -18 date phi long
    nauticalDusk = tzAngle + doSunEqn -1 -12 date phi long
    civilDusk = tzAngle + doSunEqn -1 -6 date phi long
    noon = (sunset + sunrise)/2
    t = toFloat (rem (floor time) 86400)
  in collage 500 500 <| 
       [ if not (sunrise < sunset) && (sunrise < 90) then
           filled (rgb 218 237 245)   (circle radius)
         else filled (rgb 18 62 124)   (circle radius)
       , outlined (solid grey) (circle radius)
       -- night
       , pieSlice (rgb 86 137 202)    radius astroDown sunrise
       , pieSlice (rgb 86 137 202)    radius sunset astroDusk
       -- morning
       ] ++ (
       if sunrise < sunset then
         [ pieSlice (rgb 218 237 245)   radius sunrise sunset
         , marker orange   radius sunrise
         , label           radius sunrise <| "sunrise " ++ timeAt sunrise 
         , marker orange   radius sunset
         , label           radius sunset <| "sunset " ++ timeAt sunset
         ] else []
       ) ++ (
       if civilDown < civilDusk then
         [ marker grey     radius civilDown
         , marker grey     radius civilDusk
         ] else []
       ) ++ (
       if astroDown < astroDusk then
         [ marker grey     radius astroDown
         , marker grey     radius astroDusk
         , label           radius astroDusk <| "dusk " ++ timeAt astroDusk
         , label           radius astroDown <| "down " ++ timeAt astroDown
         ] else []
       ) ++ (
       if nauticalDown < nauticalDusk then
         [ marker grey     radius nauticalDown
         , marker grey     radius nauticalDusk
         ] else []
       ) ++
       [ marker lightOrange radius <| noon
       , label           radius noon <| "noon " ++ timeAt noon
       --, hand orange   100  time
       --, hand charcoal 100 (time/60)
       , arrow (rgb 86 137 202) radius  (t/86400) 3 30
       , label  (radius+25) (360 * t/86400) <| timeAt (360 * t/86400)
       ] ++ map drawNum [0..23]

scene date phi long tz time = maybe (plainText "oops, bad input")
                                    (clock ((inSeconds time)+(toFloat tz)) (360 * (toFloat tz) / (24*60*60)) phi long)
                                    (Date.read date)

port dateIn : Signal String
port phiIn : Signal Float
port longIn : Signal Float
port tzOffsetIn : Signal Int

main = scene <~ dateIn ~ phiIn ~ longIn ~ tzOffsetIn ~ (every second)
