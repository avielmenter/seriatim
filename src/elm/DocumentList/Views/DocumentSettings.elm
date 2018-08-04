module DocumentList.Views.DocumentSettings exposing (view)

import Html exposing (Html, text)
import Html.Attributes exposing (class, type_, checked, id, for)
import Html.Events exposing (onClick, onCheck)
import Message exposing (Msg(..))
import DocumentList.Message exposing (Msg(..))
import DocumentList.Model exposing (ListDocument)
import Data.Document exposing (DocumentID(..))
import Settings.Views.SettingIcons as SettingIcons


type alias Model =
    ListDocument


publiclyViewableCheckboxID : DocumentID -> String
publiclyViewableCheckboxID (DocumentID str) =
    str ++ "_publicly_viewable"


view : Model -> Html Message.Msg
view doc =
    Html.div [ class "documentSettingsContainer" ]
        [ Html.div [ class "documentSettings" ]
            [ Html.div
                [ class "documentSettingsHeader" ]
                [ Html.span
                    [ class "exitDocumentSettings"
                    , onClick (DocumentListMessage <| ToggleDocumentSettings doc.data)
                    ]
                    [ text "x" ]
                , Html.span [] [ text "Additional Options" ]
                ]
            , SettingIcons.view { onConfirm = None, onReject = None, setting = doc.settings.publiclyViewable }
            , Html.input
                [ type_ "checkbox"
                , checked doc.data.publicly_viewable
                , id <| publiclyViewableCheckboxID doc.data.document_id
                , onCheck (\b -> DocumentListMessage <| SavePublicViewability doc.data.document_id b)
                ]
                []
            , Html.label [ for <| publiclyViewableCheckboxID doc.data.document_id ] [ text "Let anyone with a link view this document" ]
            ]
        ]
