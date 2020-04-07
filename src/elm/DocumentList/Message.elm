module DocumentList.Message exposing (Msg(..))

import Browser.Dom
import Data.Document exposing (Document, DocumentID)
import DocumentList.Model exposing (PageStatus)
import SeriatimHttp exposing (HttpResult)
import Time exposing (Posix)
import Util exposing (KeyCode, MousePosition)


type Msg
    = LoadDocuments (HttpResult (List Document))
    | DocumentCreated (HttpResult Document)
    | CreateDocument
    | CopyDocument DocumentID
    | DeleteDocument DocumentID
    | DocumentDeleted (HttpResult Document)
    | DocumentRenamed (HttpResult Document)
    | SavePublicViewability DocumentID Bool
    | PublicViewabilitySaved DocumentID (HttpResult Document)
    | AddCategory DocumentID
    | EditNewCategory DocumentID String
    | RejectCategory DocumentID
    | RemoveCategory DocumentID String
    | CategoriesUpdated DocumentID (HttpResult Document)
    | FocusOn Document
    | ToggleDocumentSettings Document
    | FocusResult (Result Browser.Dom.Error ())
    | TitleInputChange String
    | UnfocusTitle
    | Select DocumentID
    | Unselect
    | FocusSelected
    | DeleteSelected
    | ArchiveSelected
    | SetShowArchive Bool
    | SetFilter (Maybe String)
    | ClearError
    | MouseEvent MousePosition
    | KeyboardEvent KeyCode
    | Refresh PageStatus
    | TimedRefresh Posix
