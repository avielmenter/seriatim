module Data.Document exposing (..)

import Data.Category exposing (Category)
import Date exposing (Date)


type DocumentID
    = DocumentID String


type alias Document =
    { document_id : DocumentID
    , root_item_id : String
    , title : String
    , created_at : Date
    , modified_at : Maybe Date
    , publicly_viewable : Bool
    , categories : List Category
    }


inTrash : Document -> Bool
inTrash doc =
    List.filter (\c -> c.category_name == "Trash") doc.categories
        |> List.isEmpty
