module Util exposing (..)

import Date exposing (Date)
import Date.Format exposing (format)


isNothing : Maybe a -> Bool
isNothing m =
    case m of
        Just _ ->
            False

        Nothing ->
            True


isSomething : Maybe a -> Bool
isSomething m =
    not <| isNothing m


seriatimDateString : Date -> String
seriatimDateString d =
    format "%b %e, %Y %l:%M:%S %p" d
