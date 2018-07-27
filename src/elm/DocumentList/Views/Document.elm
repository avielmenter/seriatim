module DocumentList.Views.Document exposing (view, inputID, rowID, Model)

import Html exposing (Html, text, div)
import Html.Events exposing (onClick, on)
import Html.Attributes exposing (class)
import Json.Decode
import DocumentList.Message exposing (Msg(..))
import Message exposing (..)
import Data.Document exposing (Document, DocumentID)
import Util exposing (seriatimDateString)


onEnter : Message.Msg -> Html.Attribute Message.Msg
onEnter msg =
    let
        isEnter code =
            if code == 13 then
                Json.Decode.succeed msg
            else
                Json.Decode.fail "not ENTER"
    in
        on "keydown" (Json.Decode.andThen isEnter Html.Events.keyCode)


inputID : DocumentID -> String
inputID (Data.Document.DocumentID idStr) =
    "title_" ++ idStr


rowID : DocumentID -> String
rowID (Data.Document.DocumentID idStr) =
    "row_" ++ idStr


type alias Model =
    { selected : Bool
    , focusedText : Maybe String
    , doc : Document
    }


view : Model -> Html Message.Msg
view model =
    let
        focusedText =
            model.focusedText

        selected =
            model.selected

        doc =
            model.doc

        idStr : DocumentID -> String
        idStr (Data.Document.DocumentID docID) =
            docID
    in
        Html.tr
            ([ Html.Attributes.id (rowID doc.document_id)
             , Html.Events.onWithOptions
                "click"
                { stopPropagation = True
                , preventDefault = False
                }
                (Json.Decode.succeed (DocumentListMessage <| Select doc.document_id))
             ]
                ++ (if selected then
                        [ Html.Attributes.class "selected" ]
                    else
                        []
                   )
            )
            [ Html.td []
                [ case focusedText of
                    Nothing ->
                        Html.span [{- onClick (FocusOn doc) -}]
                            [ Html.a
                                [ Html.Attributes.href ("/editor/?" ++ (idStr doc.document_id))
                                , Html.Attributes.target "_blank"
                                ]
                                [ text doc.title ]
                            ]

                    Just inputText ->
                        Html.input
                            [ Html.Attributes.type_ "text"
                            , Html.Attributes.id (inputID doc.document_id)
                            , Html.Attributes.value inputText
                            , Html.Attributes.autofocus True
                            , Html.Events.onInput (\s -> DocumentListMessage <| TitleInputChange s)
                            , Html.Events.onBlur (DocumentListMessage UnfocusTitle)
                            ]
                            []
                ]
            , Html.td [] [ text <| seriatimDateString doc.created_at ]
            , Html.td [] [ text <| Maybe.withDefault "never" <| Maybe.map seriatimDateString doc.modified_at ]
            , Html.td []
                [ Html.span
                    [ onClick (DocumentListMessage <| DeleteDocument doc.document_id)
                    , class "remove"
                    ]
                    [ text "X" ]
                ]
            ]
