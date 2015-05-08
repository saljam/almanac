module Almanac where

import Debug

import List
import Html (..)
import Html.Attributes (..)
import Html.Events (..)
import Signal
import Signal ((<~), (~))
import String
import Result

import Date

import Graphics.Collage (..)
import Graphics.Element
import Time
import Color (..)
import Text

import Native.Timezone

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
    Date.day d + ((153*m + 2) // 5) + 365 * y + (y // 4) - (y // 100) + (y // 400) - 32045

j2000 = 2451545 -- the julian day for J2000

-- SO MANY MAGIC NUMBERS!
-- Mostly from http://www.stargazing.net/kepler/sunrise.html# and 
-- http://en.wikipedia.org/wiki/Sunrise_equation

-- mean longitude
l t = 280.460 + (36000.770 * t)
-- mean anamoly
g t = degrees <| 357.528 + (35999.050 * t)
-- eq centre correction
ec t = 1.915 * sin(g t) + 0.020 * sin(2*(g t))
-- ecliptic longitude of sun
lambda t = degrees <| (l t) + (ec t)
-- tilt of earth's axis
obl t = degrees <| 23.4393 - 0.0130 * t
-- sun's declination
delta t = asin(sin(obl t) * (sin(lambda t)))
e t = degrees <| -(ec t) + 2.466 * (sin (2*(lambda t))) - 0.053 * (sin(4*(lambda t)))
-- greenwhich hour angle of the sun
gha t ut = ut - pi + e t

sunEqn ut h dir date lat long =
  let
    t = (date + ut/360)/36525 -- the number of centuries since J2000
    lat' = degrees lat
    cosc = (sin(h) - sin(lat') * sin(delta t)) / ((cos lat') * cos (delta t))
    correction = if | cosc > 1  -> 0
                    | cosc < -1 -> pi
                    | otherwise -> dir * acos(cosc)
    ut' = pi - (degrees long) - (e t) - correction
  in
    if abs (ut - ut') < 0.01 then ut' else sunEqn ut' h dir date lat long

type Direction = Morning | Evening
timeAtSunAngle dir h date =
   let
      middayEstimate = pi
      dir' = case dir of
               Morning ->  1
               Evening -> -1
      date' = toFloat <| julian date - j2000
      h' = degrees h
   in
     sunEqn middayEstimate h' dir' date'

sunrise      = timeAtSunAngle Morning -0.833
astroDawn    = timeAtSunAngle Morning -18
nauticalDawn = timeAtSunAngle Morning -12
civilDawn    = timeAtSunAngle Morning -6
sunset       = timeAtSunAngle Evening -0.833
astroDusk    = timeAtSunAngle Evening -18
nauticalDusk = timeAtSunAngle Evening -12
civilDusk    = timeAtSunAngle Evening -6
noon x y z   =
  let
    rise = sunrise x y z
    set = sunset x y z
    avg = (rise + set)/2
  in
    if rise == set && rise < (pi/2) then
      avg &- pi
    else
      avg

--

marker clr len angle =
    traced (dotted clr) <| segment (0,0) (len * cos angle, len * sin angle)

slice start end =
    let
      foo = (Debug.watch "start" <| start) + (Debug.watch "end" <| end)
      factor = 1000
      arclength = floor <| (end &- start) * factor
      makePoint t = fromPolar (radius, (start + (toFloat t)/factor))
    in
      if | arclength < 25 -> if (abs start) < pi/2 then circle radius else circle 0
         | otherwise      -> polygon <| (0,0) :: List.map makePoint [0..arclength]

drawNum n =
  let
    a = turns <| -n/24 - 0.25
    r = radius + 8
  in
    move (r * cos a, r * sin a) <| toForm <| Text.plainText <| toString n

label len angle text =
  let
    ra = if angle > pi/2 && angle < 3*pi/2 then angle + pi else angle
    l = len + 50
  in
    rotate ra <| move (l * cos angle, l * sin angle) <| toForm <| Text.plainText text

complement = (&-) (3/2 * pi) 

timeAt angle =
  let
    h = (complement angle) * 24 / (2 * pi)
    m = (h - toFloat (floor h)) * 60
  in toString (floor h) ++ ":" ++ toString (floor m)

radius = 150

-- we draw things with noon as 0, then rotate to fit the actual angle.
clockface sunset dusk nauticalDusk civilDusk = group <|
  [ filled   (rgb 218 237 245)  <| circle radius
  , filled   (rgb 86 137 202)   <| slice -sunset sunset
  , filled   (rgb 18 62 124)    <| slice -dusk   dusk
  , outlined (solid grey)       <| circle radius
  -- TODO don't print the labels if they're too close together?
  , marker orange      radius sunset
  , marker orange      radius -sunset
  , marker grey        radius civilDusk
  , marker grey        radius -civilDusk
  , marker grey        radius nauticalDusk
  , marker grey        radius -nauticalDusk
  , marker grey        radius dusk
  , marker grey        radius -dusk
  , marker lightOrange radius 0 -- noon
  -- TODO times are wrong -- we haven't rotated yet.
  ]

(&-) a1 a2 =
  let
    factor = 1000
    diff =  (floor <| a1*factor) - (floor <| a2*factor) -- convert to integers so we can perform modular arithmetic
    pi' = floor <| pi*factor
  in
    (toFloat <| diff % (2*pi'))/factor

clock date lat long tz = 
  let
    offset = Native.Timezone.offset date tz
    offsetAngle = turns <| offset/(24*60)
    get event = (complement <| event date lat long) - offsetAngle
    noon'         = Debug.watch "noon" <| get noon
    dusk'         = Debug.watch "dusk" <| get astroDusk
    nauticalDusk' = get nauticalDusk
    civilDusk'    = get civilDusk
    sunset'       = Debug.watch "sunset" <| get sunset
    sunrise'      = Debug.watch "sunrise" <| get sunrise
    dawn'         = get astroDawn
  in
    collage 500 500 <|
      [ rotate noon' <| clockface (sunset'  &- noon') (dusk' &- noon') (nauticalDusk' &- noon') (civilDusk' &- noon')
      , label radius sunset'  <| "sunset "  ++ timeAt sunset'
      , label radius sunrise' <| "sunrise " ++ timeAt sunrise'
      , label radius dusk'    <| "dusk "    ++ timeAt dusk'
      , label radius dawn'    <| "dawn "    ++ timeAt dawn'
      , label radius noon'    <| "noon "    ++ timeAt noon'
      ] ++ List.map drawNum [0..23]

--

page datestr lat long =
  let
    date = Date.fromString datestr
    tz   = Native.Timezone.latlong lat long
  in
    div []
      [ div [ id "map" ] []
      , div [ id "form", class "overlay" ]
        [ input [ id "date", value datestr, type' "date", on "input" targetValue (Signal.send datec) ] []
        , p [] [ text ("Timezone: " ++ tz) ]
        , case date of
          Ok d      -> div [ id "clock" ] [ fromElement <| clock d lat long tz ]
          otherwise -> p [] [ text "bad date :-/" ]
        ]
      , footer [ class "overlay" ] [ a [ href "https://github.com/saljam/almanac" ] [ text "source" ]
                  , text " <3"
                  ]
      ]

datec = Signal.channel "1989-12-15"

port latIn : Signal.Signal Float
port longIn : Signal.Signal Float

main = page <~ (Signal.subscribe datec) ~ latIn ~ longIn

-- model ought to be (lat, long, date, tz)
