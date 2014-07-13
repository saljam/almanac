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
    r = degrees <| 90 - angle
  in
    move (len * cos r, len * sin r) <| toForm <| plainText text

hand colr len time =
  let angle = degrees (90 - 6 * inSeconds time)
  in  traced (solid colr) <| segment (0,0) (len * cos angle, len * sin angle)
  
pieSlice colr radius start end =
    let
      o = -start + 90
      angle = if end < start then end + 360 else end
      a = 4*angle - 4*start
      makePoint t = fromPolar (radius, degrees (o - t/4))
    in filled colr . polygon <| (0,0) :: map makePoint[ 0 .. a ]

radius = 180
drawNum n =
  let
    a = turns <| -n/24 + 0.25
    r = radius + 8
  in
    move (r * cos a, r * sin a) <| toForm <| plainText <| show n

timeAt angle =
  let
    h = angle * 24 / 360
  in show (floor h)

clock time phi long date =
  let
    sunrise = doSunEqn 1 -0.833 date phi long
    astroDown = doSunEqn 1 -18 date phi long
    nauticalDown = doSunEqn 1 -12 date phi long
    civilDown = doSunEqn 1 -6 date phi long
    sunset = doSunEqn -1 -0.833 date phi long
    astroDusk = doSunEqn -1 -18 date phi long
    nauticalDusk = doSunEqn -1 -12 date phi long
    civilDusk = doSunEqn -1 -6 date phi long
    noon = (sunset + sunrise)/2
  in  collage 400 400 <| 
                      [ filled (rgb 18 62 124)   (circle radius)
                       , outlined (solid grey) (circle radius)
                      --] ++ if 
                       -- night
                       , pieSlice (rgb 86 137 202)    radius astroDown sunrise
                       , pieSlice (rgb 86 137 202)    radius sunset astroDusk
                       , pieSlice (rgb 218 237 245)   radius sunrise sunset
                       -- morning
                       , marker grey     radius civilDown
                       , marker grey     radius nauticalDown
                       , marker orange   radius sunrise
                       , marker charcoal radius astroDown
                       -- evening
                       , marker grey     radius nauticalDusk
                       , marker grey     radius civilDusk
                       , marker orange   radius sunset
                       , marker charcoal radius astroDusk
                       -- noon
                       , marker lightOrange radius <| noon
                       -- labels
                       , label           radius sunset <| "sunset " ++ timeAt sunset
                       , label           radius sunrise <| "sunrise " ++ timeAt sunrise
                       , label           radius noon <| "noon " ++ timeAt noon
                       , label           radius astroDusk <| "dusk " ++ timeAt astroDusk
                       , label           radius astroDown <| "down " ++ timeAt astroDown
                       -- time
                       --, hand orange   100  time
                       --, hand charcoal 100 (time/60)
                       , hand charcoal 60  (time/1440)
                       ] ++ map drawNum [0..23]

scene date phi long time = maybe (plainText "oops, bad input") (clock time phi long)
                                 (Date.read date)

port dateIn : Signal String
port phiIn : Signal Float
port longIn : Signal Float

main = scene <~ dateIn ~ phiIn ~ longIn ~ (every second)
