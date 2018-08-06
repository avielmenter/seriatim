module Main exposing (..)

import Html exposing (Html, programWithFlags, text)
import Html.Attributes exposing (id, class, href, src, alt)
import Model exposing (..)
import Message exposing (..)
import DocumentList.Message exposing (Msg(TimedRefresh))
import Update exposing (..)
import Routing exposing (..)
import Navigation exposing (Location)
import Mouse
import Keyboard
import DocumentList.View
import Settings.View
import Views.NotFound as NotFound
import Views.LoginGreeting as LoginGreeting
import Views.Logo as Logo
import Util exposing (Flags)
import Time


subscriptions : Model -> Sub Message.Msg
subscriptions model =
    Sub.batch
        [ Mouse.clicks MouseEvent
        , Keyboard.downs KeyboardEvent
        , Time.every Time.minute (\t -> DocumentListMessage <| TimedRefresh t)
        ]


view : Model -> Html Message.Msg
view model =
    Html.div []
        [ Html.header [] <|
            [ Html.div
                [ class "headerContent flexibleContentWidth flexHeader" ]
                [ Logo.view
                , LoginGreeting.view model
                ]
            , Settings.View.view model.settings
            ]
        , Html.main_ [ class "flexibleContentWidth" ]
            [ case model.route of
                DocumentList ->
                    DocumentList.View.view model

                _ ->
                    NotFound.view {}
            ]
        ]


main : Program Flags Model Message.Msg
main =
    Navigation.programWithFlags OnLocationChange
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }
