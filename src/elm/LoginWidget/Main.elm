module LoginWidget.Main exposing (..)

import Http
import Html exposing (programWithFlags)
import LoginWidget.HttpRequests exposing (getLoggedInUser)
import LoginWidget.Model exposing (Model, LoginStatus(..))
import Message exposing (..)
import LoginWidget.Message
import LoginWidget.View exposing (view)
import LoginWidget.Update exposing (update)
import Util exposing (Flags)


main : Program Flags Model Msg
main =
    Html.programWithFlags
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
    , Http.send (\r -> LoginMessage <| LoginWidget.Message.Load r) (getLoggedInUser flags.seriatim_server_url)
    )
