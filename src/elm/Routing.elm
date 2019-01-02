module Routing exposing (Route(..), matchers, parseFragment, parseLocation)

import Url
import Url.Parser exposing (..)


type Route
    = DocumentList
    | NotFoundRoute


matchers : Parser (Route -> a) a
matchers =
    oneOf
        [ map DocumentList (s "documents")
        ]


parseLocation : Url.Url -> Route
parseLocation location =
    Maybe.withDefault NotFoundRoute (parse matchers location)


parseFragment : Url.Url -> String
parseFragment location =
    Maybe.withDefault "" location.fragment
