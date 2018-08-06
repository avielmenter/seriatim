module DocumentList.Views.DocumentList exposing (view)

import Data.Document exposing (DocumentID)
import DocumentList.Model exposing (ListDocument)
import DocumentList.Views.Document as Document
import DocumentList.Views.DocumentTableHeader as TableHeader
import Html exposing (Html, text)
import Html.Attributes exposing (id)
import Message exposing (..)
import Date exposing (Date)


type alias Model =
    { focused : Maybe ( DocumentID, String )
    , selected : Maybe DocumentID
    , documents : List ListDocument
    , loadTime : Maybe Date
    }


view : Model -> Html Msg
view model =
    let
        viewDocument : ListDocument -> Html Msg
        viewDocument doc =
            let
                focusedText =
                    case model.focused of
                        Just ( docID, docTitle ) ->
                            if docID == doc.data.document_id then
                                (Just docTitle)
                            else
                                Nothing

                        Nothing ->
                            Nothing

                selected =
                    case model.selected of
                        Just docID ->
                            docID == doc.data.document_id

                        Nothing ->
                            False
            in
                Document.view { focusedText = focusedText, selected = selected, doc = doc, loadTime = model.loadTime }
    in
        Html.table [ id "documents" ]
            ([ TableHeader.view ]
                ++ (List.map viewDocument model.documents)
            )
