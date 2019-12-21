module DocumentList.Views.Document exposing (Model, inputID, rowID, view)

import Data.Document exposing (DocumentID)
import DocumentList.Message exposing (Msg(..))
import DocumentList.Model exposing (ListDocument)
import DocumentList.Views.DocumentSettings as DocumentSettings
import Html exposing (Html, text)
import Html.Attributes exposing (class)
import Html.Events exposing (onClick)
import Json.Decode
import Message exposing (Msg(..))
import Time exposing (Posix)
import Util exposing (seriatimDateString)
import Views.MaterialIcon as MaterialIcon


inputID : DocumentID -> String
inputID (Data.Document.DocumentID idStr) =
    "title_" ++ idStr


rowID : DocumentID -> String
rowID (Data.Document.DocumentID idStr) =
    "row_" ++ idStr


type alias Model =
    { selected : Bool
    , focusedText : Maybe String
    , doc : ListDocument
    , loadTime : Maybe Posix
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
        ([ Html.Attributes.id (rowID doc.data.document_id)
         , Html.Events.custom
            "click"
            (Json.Decode.map
                (\msg ->
                    { message = msg
                    , stopPropagation = True
                    , preventDefault = False
                    }
                )
                (Json.Decode.succeed (DocumentListMessage <| Select doc.data.document_id))
            )
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
                            [ Html.Attributes.href ("/editor/?" ++ idStr doc.data.document_id)
                            , Html.Attributes.target "_blank"
                            ]
                            [ text doc.data.title ]
                        ]

                Just inputText ->
                    Html.input
                        [ Html.Attributes.type_ "text"
                        , Html.Attributes.id (inputID doc.data.document_id)
                        , Html.Attributes.value inputText
                        , Html.Attributes.autofocus True
                        , Html.Attributes.class "documentName"
                        , Html.Events.onInput (\s -> DocumentListMessage <| TitleInputChange s)
                        , Html.Events.onBlur (DocumentListMessage UnfocusTitle)
                        ]
                        []
            ]
        , Html.td [] [ text <| seriatimDateString model.loadTime doc.data.created_at ]
        , Html.td [] [ text <| Maybe.withDefault "never" <| Maybe.map (seriatimDateString model.loadTime) doc.data.modified_at ]
        , Html.td [] <|
            [ Html.span
                [ class "documentSettingsIcon"
                , onClick (DocumentListMessage <| ToggleDocumentSettings doc.data)
                ]
                [ MaterialIcon.view "more_vert" ]
            ]
                ++ (if doc.settings.visible then
                        [ DocumentSettings.view doc ]

                    else
                        []
                   )
        ]
