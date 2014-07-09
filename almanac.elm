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

sunEqn ut h dir date loc =
  let
    (phi, long) = loc
    t = (date + ut/360)/36525 -- the number of centuries since J2000
    cosc = (dsin(h) - dsin(phi) * dsin(delta t)) / (dcos(phi) * dcos(delta t))
    correction = dir * acos(cosc) * 180/pi
    ut' = ut - (long + gha t ut  +  correction)
  in
    if abs (ut - ut') < 0.01 then ut' else sunEqn ut' h dir date loc

doSunEqn dir h date =
   let
      middayEstimate = 180
   in
     sunEqn middayEstimate h dir <| toFloat (julian date - j2000)

sunrise = doSunEqn 1 -0.833
astroDown = doSunEqn 1 -18
nauticalDown = doSunEqn 1 -12
civilDown = doSunEqn 1 -6
sunset = doSunEqn -1 -0.833
astroDusk = doSunEqn -1 -18
nauticalDusk = doSunEqn -1 -12
civilDusk = doSunEqn -1 -6

marker clr len angle =
  let
    r = degrees <| -angle + 90
  in
    traced (dotted clr) <| segment (0,0) (len * cos r, len * sin r)
    
hand clr len time =
  let angle = degrees (90 - 6 * inSeconds time)
  in  traced (solid clr) <| segment (0,0) (len * cos angle, len * sin angle)
  
radius = 120
drawNum n =
  let
    a = turns <| -n/24 + 0.25
    r = radius + 8
  in
    move (r * cos a, r * sin a) <| toForm <| plainText <| show n

clock time date phi long =
  let
    at f = f date (phi, long)
  in
    collage 400 400 <| [ filled    lightGrey   (ngon 24 radius)
                       , outlined (solid grey) (ngon 24 radius)
                       -- morning
                       , marker grey     radius <| at civilDown
                       , marker grey     radius <| at nauticalDown
                       , marker orange   radius <| at sunrise
                       , marker charcoal radius <| at astroDown
                       -- evening
                       , marker grey     radius <| at nauticalDusk
                       , marker grey     radius <| at civilDusk
                       , marker orange   radius <| at sunset
                       , marker charcoal radius <| at astroDusk
                       -- noon
                       , marker lightOrange radius <| (at sunset + at sunrise)/2
                       -- time
                       , hand orange   100  time
                       , hand charcoal 100 (time/60)
                       , hand charcoal 60  (time/1440)
                       ] ++ map drawNum [0..23]

dateIn = input <| Field.Content "25 Oct 1998" (Field.Selection 0 0 Field.Forward)
phiIn = input <| Field.Content "52.5" (Field.Selection 0 0 Field.Forward)
longIn = input <| Field.Content "-1.9167" (Field.Selection 0 0 Field.Forward)

-- Good old map. Sorry about the notation.
(><>) : (a -> b) -> Maybe a -> Maybe b
(><>) f m = maybe Nothing (\x -> Just (f x)) m

-- The fish operator. Like a fold which just applys.
(>-<>) : Maybe (a->b) -> Maybe a -> Maybe b
(>-<>) m fm = maybe Nothing (\x -> x ><> fm) m

scene dateC phiC longC t = flow down
          [ flow right
            [ container 120 36 midLeft <| plainText "date"
            , container 220 36 midLeft <| size 190 26 <|
              Field.field Field.defaultStyle dateIn.handle id "25 Oct 1998" dateC
            ]
          , flow right
            [ container 120 36 midLeft <| plainText "coordinates"
            , container 100 36 midLeft <| size 90 26 <|
              Field.field Field.defaultStyle phiIn.handle id "52.5" phiC
            , container 100 36 midLeft <| size 90 26 <|
              Field.field Field.defaultStyle longIn.handle id "-1.9167" longC
            ]
          , maybe (plainText "oops, bad input") id
              (clock t ><> (Date.read dateC.string)
                       >-<> (String.toFloat phiC.string)
                       >-<> (String.toFloat longC.string))
          ]

main = scene <~ dateIn.signal ~ phiIn.signal ~ longIn.signal ~ (every second)
