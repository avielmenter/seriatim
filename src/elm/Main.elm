module Main exposing (..)

import Html exposing (Html, div, em, p, h2, h3, text, a, programWithFlags)
import Html.Attributes exposing (id, href)
import Model exposing (..)
import Message exposing (..)
import Update exposing (..)
import Routing exposing (..)
import Navigation exposing (Location)
import Mouse
import Keyboard
import DocumentList.View
import Util exposing (Flags)


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ Mouse.clicks MouseEvent
        , Keyboard.downs KeyboardEvent
        ]


view : Model -> Html Msg
view model =
    case model.route of
        DocumentList ->
            DocumentList.View.view model

        _ ->
            div
                [ id "msg404" ]
                [ h2 []
                    [ em [] [ text "Oops! " ]
                    ]
                , h3 []
                    [ text "We could not find a URL at the specified path. Click "
                    , a [ href "/" ] [ text "here" ]
                    , text " to return home."
                    ]
                ]


main : Program Flags Model Msg
main =
    Navigation.programWithFlags OnLocationChange
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }
