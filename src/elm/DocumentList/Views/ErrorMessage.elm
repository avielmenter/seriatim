module DocumentList.Views.ErrorMessage exposing (..)

import Html exposing (..)
import Html.Attributes exposing (class)
import Html.Events exposing (onClick)
import DocumentList.Message exposing (Msg(..))
import Message exposing (..)


type alias Model =
    String


view : Model -> Html Message.Msg
view msg =
    div [ class "errorMessage" ]
        [ text msg
        , span [ class "removeError", onClick <| DocumentListMessage ClearError ] [ text "x" ]
        ]
