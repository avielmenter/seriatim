module Views.LoadingSpinner exposing (view)

import Html exposing (Html, div)
import Html.Attributes exposing (class)
import Message exposing (Msg)


view : Html Msg
view =
    div
        [ class "spinner"
        ]
        [ div [ class "bounce1" ] []
        , div [ class "bounce2" ] []
        , div [ class "bounce3" ] []
        ]
