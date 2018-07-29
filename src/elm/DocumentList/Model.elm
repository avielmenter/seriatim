module DocumentList.Model exposing (Model, PageStatus(..))

import Data.Document exposing (Document, DocumentID)
import Util exposing (Flags)


type PageStatus
    = Loading
    | Displaying
    | Error


type alias Model =
    { status : PageStatus
    , config : Flags
    , error : Maybe String
    , focused : Maybe ( DocumentID, String )
    , selected : Maybe DocumentID
    , documents : List Document
    }
