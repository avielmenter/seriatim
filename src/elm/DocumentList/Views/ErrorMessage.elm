module DocumentList.Views.ErrorMessage exposing (Model, view)

import DocumentList.Message exposing (Msg(..))
import Html exposing (Html, div, text, span)
import Html.Attributes exposing (class)
import Html.Events exposing (custom)
import Json.Decode as Json
import Message exposing (Msg(..))


type alias Model =
    String


view : Model -> Html Message.Msg
view msg =
    div [ class "errorMessage" ]
        [ text msg
        , span
            [ class "removeError"
            , custom
                "click"
                (Json.map
                    (\clickMessage ->
                        { message = clickMessage
                        , stopPropagation = True
                        , preventDefault = True
                        }
                    )
                    (Json.succeed <| DocumentListMessage ClearError)
                )
            ]
            [ text "x" ]
        ]
