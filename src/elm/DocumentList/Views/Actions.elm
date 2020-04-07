module DocumentList.Views.Actions exposing (view)

import Data.Document exposing (DocumentID)
import DocumentList.Message exposing (Msg(..))
import Html exposing (Html, text)
import Html.Attributes exposing (class, id)
import Html.Events exposing (onClick)
import Message exposing (Msg(..))
import Util exposing (isSomething)
import Views.MaterialIcon as MaterialIcon


type alias Model =
    { documentSelected : Maybe DocumentID
    , inTrash : Bool
    , inArchive : Bool
    }


view : Model -> Html Message.Msg
view model =
    Html.div [ id "actions" ]
        ([ Html.h3 []
            [ text "Actions" ]
         , Html.button
            [ class "createDocument"
            , onClick <| DocumentListMessage CreateDocument
            ]
            [ MaterialIcon.view "add"
            , text "Create"
            ]
         , Html.button
            (class "renameDocument"
                :: (if isSomething model.documentSelected then
                        [ onClick <| DocumentListMessage FocusSelected ]

                    else
                        [ class "disabled" ]
                   )
            )
            [ MaterialIcon.view "create"
            , text "Rename"
            ]
         ]
            ++ (if not model.inArchive then
                    [ Html.button
                        (class "archiveDocument"
                            :: (if isSomething model.documentSelected then
                                    [ onClick <| DocumentListMessage ArchiveSelected ]

                                else
                                    [ class "disabled" ]
                               )
                        )
                        [ MaterialIcon.view "archive"
                        , text "Archive"
                        ]
                    ]

                else
                    [ Html.button
                        (class "archiveDocument"
                            :: (case model.documentSelected of
                                    Just docID ->
                                        [ onClick <| DocumentListMessage (RemoveCategory docID "Archive") ]

                                    Nothing ->
                                        [ class "disabled" ]
                               )
                        )
                        [ MaterialIcon.view "unarchive"
                        , text "Unarchive"
                        ]
                    ]
               )
            ++ (if not model.inTrash then
                    [ Html.button
                        (class "copyDocument"
                            :: (case model.documentSelected of
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
                        (class "deleteDocument"
                            :: (if isSomething model.documentSelected then
                                    [ onClick <| DocumentListMessage DeleteSelected ]

                                else
                                    [ class "disabled" ]
                               )
                        )
                        [ MaterialIcon.view "delete"
                        , text "Move to Trash"
                        ]
                    ]

                else
                    [ Html.button
                        (class "copyDocument"
                            :: (case model.documentSelected of
                                    Just docID ->
                                        [ onClick <| DocumentListMessage (RemoveCategory docID "Trash") ]

                                    Nothing ->
                                        [ class "disabled" ]
                               )
                        )
                        [ MaterialIcon.view "restore_from_trash"
                        , text "Restore"
                        ]
                    , Html.button
                        (class "deleteDocument"
                            :: (case model.documentSelected of
                                    Just _ ->
                                        [ onClick <| DocumentListMessage DeleteSelected ]

                                    Nothing ->
                                        [ class "disabled" ]
                               )
                        )
                        [ MaterialIcon.view "delete_forever"
                        , text "Delete Forever"
                        ]
                    ]
               )
        )
