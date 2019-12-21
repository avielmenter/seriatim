module DocumentList.Views.DocumentList exposing (view)

import Data.Document exposing (DocumentID)
import DocumentList.Model exposing (ListDocument)
import DocumentList.Views.Document as Document
import DocumentList.Views.DocumentTableHeader as TableHeader
import Html exposing (Html)
import Html.Attributes exposing (id)
import Message exposing (Msg(..))
import Time exposing (Posix)


type alias Model =
    { focused : Maybe ( DocumentID, String )
    , selected : Maybe DocumentID
    , documents : List ListDocument
    , loadTime : Maybe Posix
    }


view : Model -> Html Msg
view model =
    let
        viewDocument : ListDocument -> Html Msg
        viewDocument doc =
            let
                focusedText =
                    Maybe.withDefault Nothing
                        (Maybe.map
                            (\( docID, docTitle ) ->
                                if docID == doc.data.document_id then
                                    Just docTitle

                                else
                                    Nothing
                            )
                            model.focused
                        )

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
        (TableHeader.view
            :: List.map viewDocument model.documents
        )
