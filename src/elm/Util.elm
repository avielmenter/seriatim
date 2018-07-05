module Util exposing (..)


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
