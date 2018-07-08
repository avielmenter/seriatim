module Data.Document exposing (..)

import Date exposing (Date)


type DocumentID
    = DocumentID String


type alias Document =
    { document_id : DocumentID
    , root_item_id : String
    , title : String
    , created_at : Date
    , modified_at : Maybe Date
    }


getDocumentByID : DocumentID -> List Document -> Maybe Document
getDocumentByID docID docs =
    docs
        |> List.filter (\d -> d.document_id == docID)
        |> List.head
