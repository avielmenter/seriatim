module DocumentList.Model exposing (Model, PageStatus(..))

import Data.Document exposing (Document, DocumentID)


type PageStatus
    = Loading
    | Displaying
    | Error


type alias Model =
    { status : PageStatus
    , error : Maybe String
    , focused : Maybe ( DocumentID, String )
    , selected : Maybe DocumentID
    , documents : List Document
    }
