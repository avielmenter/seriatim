module DocumentList.Message exposing (..)

import SeriatimHttp exposing (SeriatimResult, HttpResult)
import Data.Document exposing (Document, DocumentID)
import Dom
import Mouse
import Keyboard
import Time exposing (Time)
import DocumentList.Model exposing (PageStatus)


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
    | FocusResult (Result Dom.Error ())
    | TitleInputChange String
    | UnfocusTitle
    | Select DocumentID
    | Unselect
    | FocusSelected
    | DeleteSelected
    | SetFilter (Maybe String)
    | ClearError
    | MouseEvent Mouse.Position
    | KeyboardEvent Keyboard.KeyCode
    | Refresh PageStatus
    | TimedRefresh Time
