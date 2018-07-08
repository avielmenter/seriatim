module DocumentList.Views.ErrorMessage exposing (..)

import Html exposing (..)
import Html.Attributes exposing (class)
import Html.Events exposing (onClick)
import DocumentList.Message exposing (..)


type alias Model =
    String


view : Model -> Html Msg
view msg =
    div [ class "errorMessage" ]
        [ text msg
        , span [ class "removeError", onClick ClearError ] [ text "x" ]
        ]
