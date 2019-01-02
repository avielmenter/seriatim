module DocumentList.Model exposing (..)

import Data.Document exposing (Document, DocumentID)
import Settings.Model exposing (Setting)
import Util exposing (Flags)
import Time exposing (Posix)


type PageStatus
    = Loading
    | Displaying
    | Error


type alias DocumentSettings =
    { visible : Bool
    , publiclyViewable : Setting Bool
    , newCategory : Setting String
    }


type alias ListDocument =
    { data : Document
    , settings : DocumentSettings
    }


type alias Model =
    { status : PageStatus
    , config : Flags
    , error : Maybe String
    , focused : Maybe ( DocumentID, String )
    , selected : Maybe DocumentID
    , filter : Maybe String
    , documents : List ListDocument
    , loadTime : Maybe Posix
    }


getDocumentByID : DocumentID -> List ListDocument -> Maybe ListDocument
getDocumentByID docID docs =
    docs
        |> List.filter (\d -> d.data.document_id == docID)
        |> List.head
