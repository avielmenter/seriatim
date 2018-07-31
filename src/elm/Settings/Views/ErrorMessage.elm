module Settings.Views.ErrorMessage exposing (..)

import Message exposing (Msg(..))
import Settings.Message exposing (Msg(..))
import Html exposing (Html, div, text, span)
import Html.Attributes exposing (class)
import Html.Events exposing (onClick)


type alias Model =
    String


view : Model -> Html Message.Msg
view msg =
    div [ class "errorMessage" ]
        [ text msg
        , span [ class "removeError", onClick <| SettingsMessage ClearError ] [ text "x" ]
        ]
