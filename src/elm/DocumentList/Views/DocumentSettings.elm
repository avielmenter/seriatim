module DocumentList.Views.DocumentSettings exposing (view)

import Html exposing (Html, text)
import Html.Attributes exposing (class, type_, checked, id, for, maxlength, value)
import Html.Events exposing (onClick, onCheck, onInput)
import Message exposing (Msg(..))
import DocumentList.Message exposing (Msg(..))
import DocumentList.Model exposing (ListDocument)
import Data.Document exposing (DocumentID(..))
import Settings.Model exposing (getSettingValue)
import Settings.Views.SettingIcons as SettingIcons
import DocumentList.Views.Category as CategoryView


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
            , Html.div
                [ class "documentSettingContents" ]
                [ Html.h4 [] [ text "Visibility:" ]
                , SettingIcons.view { onConfirm = None, onReject = None, setting = doc.settings.publiclyViewable }
                , Html.input
                    [ type_ "checkbox"
                    , checked doc.data.publicly_viewable
                    , id <| publiclyViewableCheckboxID doc.data.document_id
                    , onCheck (\b -> DocumentListMessage <| SavePublicViewability doc.data.document_id (not b))
                    ]
                    []
                , Html.label [ for <| publiclyViewableCheckboxID doc.data.document_id ] [ text "Let anyone with a link view this document" ]
                , Html.h4 [] [ text "Categories: " ]
                , Html.ul [ class "categorySettings" ]
                    (if List.isEmpty doc.data.categories then
                        [ Html.li [ class "noCategories" ] [ text "None" ] ]
                     else
                        (List.filter (\c -> c.category_name /= "Trash") doc.data.categories
                            |> List.map
                                (\c -> CategoryView.view { document_id = doc.data.document_id, category = c })
                        )
                    )
                , Html.h4 [] [ text "Add Category:" ]
                , SettingIcons.view
                    { onConfirm = (DocumentListMessage <| AddCategory doc.data.document_id)
                    , onReject = (DocumentListMessage <| RejectCategory doc.data.document_id)
                    , setting = doc.settings.newCategory
                    }
                , Html.input
                    [ type_ "text"
                    , value <| getSettingValue doc.settings.newCategory ""
                    , onInput (\s -> DocumentListMessage <| EditNewCategory doc.data.document_id s)
                    , maxlength 32
                    ]
                    []
                ]
            ]
        ]
