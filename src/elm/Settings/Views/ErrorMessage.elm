module Settings.Views.ErrorMessage exposing (Model, view)

import Html exposing (Html, div, span, text)
import Html.Attributes exposing (class)
import Html.Events exposing (onClick)
import Message exposing (Msg(..))
import Settings.Message exposing (Msg(..))


type alias Model =
    String


view : Model -> Html Message.Msg
view msg =
    div [ class "errorMessage" ]
        [ text msg
        , span [ class "removeError", onClick <| SettingsMessage ClearError ] [ text "x" ]
        ]
