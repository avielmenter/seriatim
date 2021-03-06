module Main exposing (main, subscriptions, view)

import Browser
import Browser.Events
import DocumentList.Message exposing (Msg(..))
import DocumentList.View
import Html
import Html.Attributes exposing (class)
import Message exposing (Msg(..), keyDecoder, mouseDecoder)
import Model exposing (Model, init)
import Routing exposing (Route(..))
import Settings.View
import Time
import Update exposing (update)
import Util exposing (Flags, KeyCode(..))
import Views.LoginGreeting as LoginGreeting
import Views.Logo as Logo
import Views.NotFound as NotFound


subscriptions : Model -> Sub Message.Msg
subscriptions _ =
    Sub.batch
        [ Browser.Events.onClick mouseDecoder
        , Browser.Events.onKeyDown keyDecoder
        , Time.every (1000 * 60) (\t -> DocumentListMessage <| TimedRefresh t)
        ]


view : Model -> Browser.Document Message.Msg
view model =
    { title = "Seriatim | Document List"
    , body =
        [ Html.div []
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
        ]
    }


main : Program Flags Model Message.Msg
main =
    Browser.application
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        , onUrlChange = UrlChanged
        , onUrlRequest = UrlRequested
        }
