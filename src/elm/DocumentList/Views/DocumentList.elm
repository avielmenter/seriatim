module DocumentList.Views.DocumentList exposing (view)

import Data.Document as Data
import DocumentList.Views.Document as Document
import Html exposing (Html, text)
import Html.Attributes exposing (id)
import DocumentList.Message exposing (..)


type alias Model =
    { focused : Maybe ( Data.DocumentID, String )
    , selected : Maybe Data.DocumentID
    , documents : List Data.Document
    }


view : Model -> Html Msg
view model =
    let
        viewDocument : Data.Document -> Html Msg
        viewDocument doc =
            let
                focusedText =
                    case model.focused of
                        Just ( docID, docTitle ) ->
                            if docID == doc.document_id then
                                (Just docTitle)
                            else
                                Nothing

                        Nothing ->
                            Nothing

                selected =
                    case model.selected of
                        Just docID ->
                            docID == doc.document_id

                        Nothing ->
                            False
            in
                Document.view { focusedText = focusedText, selected = selected, doc = doc }
    in
        Html.table [ id "documents" ]
            ([ Html.tr []
                [ Html.td [] [ Html.span [] [ text "Title" ] ]
                , Html.td [] [ Html.span [] [ text "Created" ] ]
                , Html.td [] [ Html.span [] [ text "Last Modified" ] ]
                , Html.td [] [ Html.span [] [ text "" ] ]
                ]
             ]
                ++ (List.map viewDocument model.documents)
            )
