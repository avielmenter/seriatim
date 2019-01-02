module LoginWidget.Main exposing (init, main, programUpdate, subscriptions)

import Browser
import Http
import LoginWidget.HttpRequests exposing (getLoggedInUser)
import LoginWidget.Message
import LoginWidget.Model exposing (LoginStatus(..), Model)
import LoginWidget.Update exposing (update)
import LoginWidget.View exposing (view)
import Message exposing (..)
import Util exposing (Flags)


main : Program Flags Model Msg
main =
    Browser.element
        { init = init
        , view = view
        , update = programUpdate
        , subscriptions = subscriptions
        }


programUpdate : Message.Msg -> Model -> ( Model, Cmd Message.Msg )
programUpdate msg model =
    case msg of
        LoginMessage lm ->
            update lm model

        _ ->
            ( model, Cmd.none )


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none


init : Flags -> ( Model, Cmd Msg )
init flags =
    ( { status = Loading
      , flags = flags
      }
    , getLoggedInUser flags.seriatim_server_url (\r -> LoginMessage <| LoginWidget.Message.Load r)
    )
