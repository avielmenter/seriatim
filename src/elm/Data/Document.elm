module Data.Document exposing (Document, DocumentID(..), inTrash)

import Data.Category exposing (Category)
import Time exposing (Posix)


type DocumentID
    = DocumentID String


type alias Document =
    { document_id : DocumentID
    , root_item_id : String
    , title : String
    , created_at : Posix
    , modified_at : Maybe Posix
    , publicly_viewable : Bool
    , toc_item_id : Maybe String
    , categories : List Category
    }


inTrash : Document -> Bool
inTrash doc =
    List.filter (\c -> c.category_name == "Trash") doc.categories
        |> List.isEmpty
