module DocumentList.Message exposing (..)

import SeriatimHttp exposing (SeriatimResult, HttpResult)
import Data.Document exposing (Document, DocumentID)
import Dom
import Mouse
import Keyboard


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
    | FocusOn Document
    | ToggleDocumentSettings Document
    | FocusResult (Result Dom.Error ())
    | TitleInputChange String
    | UnfocusTitle
    | Select DocumentID
    | Unselect
    | FocusSelected
    | DeleteSelected
    | ClearError
    | MouseEvent Mouse.Position
    | KeyboardEvent Keyboard.KeyCode
    | Refresh
