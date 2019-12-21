module Util exposing (Flags, KeyCode(..), MousePosition, isNothing, isSomething, seriatimDateString)

import DateFormat exposing (amPmUppercase, dayOfMonthNumber, format, hourNumber, minuteFixed, monthNameFull, secondFixed, text, yearNumber)
import Time exposing (Posix, toDay, toHour, toMinute, toMonth, toYear, utc)


type alias MousePosition =
    ()


type KeyCode
    = Enter
    | Escape
    | Other String


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


seriatimDateString : Maybe Posix -> Posix -> String
seriatimDateString currDate d =
    case currDate of
        Nothing ->
            format
                [ monthNameFull
                , text " "
                , dayOfMonthNumber
                , text ", "
                , yearNumber
                , text " "
                , hourNumber
                , text ":"
                , minuteFixed
                , text ":"
                , secondFixed
                , text " "
                , amPmUppercase
                ]
                utc
                d

        Just curr ->
            let
                yearDiff =
                    toYear utc curr - toYear utc d

                dayDiff =
                    toDay utc curr - toDay utc d

                hourDiff =
                    toHour utc curr - toHour utc d

                minuteDiff =
                    toMinute utc curr - toMinute utc d
            in
            if yearDiff /= 0 then
                format [ monthNameFull, text " ", dayOfMonthNumber, text ", ", yearNumber ] utc d

            else if toMonth utc curr /= toMonth utc d then
                format [ monthNameFull, text " ", dayOfMonthNumber ] utc d

            else if dayDiff == 1 then
                "yesterday"

            else if dayDiff /= 0 then
                String.fromInt dayDiff ++ " days ago"

            else if hourDiff == 1 then
                "1 hour ago"

            else if hourDiff /= 0 then
                String.fromInt hourDiff ++ " hours ago"

            else if minuteDiff == 1 then
                "1 minute ago"

            else if minuteDiff /= 0 then
                String.fromInt minuteDiff ++ " minutes ago"

            else
                "Just now"


type alias Flags =
    { seriatim_client_url : String
    , seriatim_server_url : String
    }
