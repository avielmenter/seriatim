module DocumentList.Model exposing (..)

import Data.Document exposing (Document, DocumentID)
import Settings.Model exposing (Setting)
import Util exposing (Flags)
import Date exposing (Date)


type PageStatus
    = Loading
    | Displaying
    | Error


type alias DocumentSettings =
    { visible : Bool
    , publiclyViewable : Setting Bool
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
    , documents : List ListDocument
    , loadTime : Maybe Date
    }


getDocumentByID : DocumentID -> List ListDocument -> Maybe ListDocument
getDocumentByID docID docs =
    docs
        |> List.filter (\d -> d.data.document_id == docID)
        |> List.head
