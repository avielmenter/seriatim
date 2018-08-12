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
    , inTrash : Bool
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
            ([ class "renameDocument"
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
         ]
            ++ if not model.inTrash then
                [ Html.button
                    ([ class "copyDocument"
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
                    ([ class "deleteDocument"
                     ]
                        ++ (if isSomething model.documentSelected then
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
                    ([ class "copyDocument" ]
                        ++ (case model.documentSelected of
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
                    ([ class "deleteDocument" ]
                        ++ (case model.documentSelected of
                                Just docID ->
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
