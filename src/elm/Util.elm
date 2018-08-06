module Util exposing (..)

import Date exposing (..)
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


seriatimDateString : Maybe Date -> Date -> String
seriatimDateString currDate d =
    case currDate of
        Nothing ->
            format "%b %e, %Y %l:%M:%S %p" d

        Just curr ->
            let
                yearDiff =
                    year curr - year d

                dayDiff =
                    day curr - day d

                hourDiff =
                    hour curr - hour d

                minuteDiff =
                    minute curr - minute d
            in
                if yearDiff /= 0 then
                    format "%b %e, %Y" d
                else if dayDiff /= 0 then
                    format "%e %B" d
                else if hourDiff == 1 then
                    "1 hour ago"
                else if hourDiff /= 0 then
                    (toString hourDiff) ++ " hours ago"
                else if minuteDiff == 1 then
                    "1 minute ago"
                else if minuteDiff /= 0 then
                    (toString minuteDiff) ++ " minutes ago"
                else
                    "Just now"


type alias Flags =
    { seriatim_client_url : String
    , seriatim_server_url : String
    }
