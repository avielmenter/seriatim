module DocumentList.Views.Actions exposing (view)

import Html exposing (Html, text)
import Html.Attributes exposing (id, class)
import Html.Events exposing (onClick)
import DocumentList.Message exposing (Msg(..))
import Message exposing (..)
import Data.Document exposing (DocumentID)
import Views.MaterialIcon as MaterialIcon
import Util exposing (isSomething)


type alias Model =
    { documentSelected : Maybe DocumentID
    }


view : Model -> Html Message.Msg
view model =
    Html.div [ id "actions" ]
        [ Html.h3 [] [ text "Actions" ]
        , Html.button
            [ id "createDocument"
            , onClick <| DocumentListMessage CreateDocument
            ]
            [ MaterialIcon.view "add"
            , text "Create"
            ]
        , Html.button
            ([ id "renameDocument"
             ]
                ++ (if isSomething model.documentSelected then
                        [ onClick <| DocumentListMessage FocusSelected ]
                    else
                        [ class "disabled" ]
                   )
            )
            [ MaterialIcon.view "create"
            , text "Rename"
            ]
        , Html.button
            ([ id "copyDocument"
             ]
                ++ (case model.documentSelected of
                        Just docID ->
                            [ onClick <| DocumentListMessage (CopyDocument docID) ]

                        Nothing ->
                            [ class "disabled" ]
                   )
            )
            [ MaterialIcon.view "file_copy"
            , text "Copy"
            ]
        , Html.button
            ([ id "deleteDocument"
             ]
                ++ (if isSomething model.documentSelected then
                        [ onClick <| DocumentListMessage DeleteSelected ]
                    else
                        [ class "disabled" ]
                   )
            )
            [ MaterialIcon.view "delete"
            , text "Delete"
            ]
        ]
