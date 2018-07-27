module Routing exposing (..)

import Navigation exposing (Location)
import UrlParser exposing (..)


type Route
    = DocumentList
    | NotFoundRoute


matchers : Parser (Route -> a) a
matchers =
    oneOf
        [ map DocumentList (s "documents")
        ]


parseLocation : Location -> Route
parseLocation location =
    case (parsePath matchers location) of
        Just route ->
            route

        Nothing ->
            NotFoundRoute
