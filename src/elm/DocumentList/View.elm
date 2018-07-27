module DocumentList.View exposing (..)

import Model exposing (..)
import DocumentList.Model exposing (PageStatus(..))
import Message exposing (..)
import DocumentList.Message exposing (Msg(..))
import Html exposing (Html, div, text)
import Html.Attributes exposing (id)
import DocumentList.Views.Actions as ActionsView
import DocumentList.Views.DocumentList as DLView
import DocumentList.Views.DocumentTableHeader as TableHeader
import DocumentList.Views.LoadingRow as LoadingRow
import DocumentList.Views.ErrorMessage as ErrorMessage
import Html.Events exposing (onClick)
import Util exposing (..)


view : Model -> Html Message.Msg
view model =
    div [ id "dlContent" ]
        [ ActionsView.view { documentSelected = isSomething model.documentList.selected }
        , div [ id "documentList" ]
            ([ Html.h3 [] <|
                [ text "Documents"
                , Html.span [ onClick (DocumentListMessage Refresh), id "refresh" ] []
                ]
             ]
                ++ case model.documentList.status of
                    Displaying ->
                        (Maybe.map (\err -> [ ErrorMessage.view <| "ERROR: " ++ err ]) model.documentList.error
                            |> Maybe.withDefault []
                        )
                            ++ [ DLView.view
                                    { focused = model.documentList.focused
                                    , selected = model.documentList.selected
                                    , documents = model.documentList.documents
                                    }
                               ]

                    Loading ->
                        [ Html.table [ id "documents" ]
                            ([ TableHeader.view
                             ]
                                ++ (List.range 0 2 |> List.map (\_ -> LoadingRow.view))
                            )
                        ]

                    Error ->
                        [ ErrorMessage.view <| "ERROR: " ++ Maybe.withDefault "An unknown error has occurred" model.documentList.error
                        , Html.table [ id "documents" ] [ TableHeader.view ]
                        ]
            )
        ]
