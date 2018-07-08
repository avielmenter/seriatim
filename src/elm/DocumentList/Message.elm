module DocumentList.Message exposing (..)

import Http
import SeriatimHttp exposing (SeriatimResult, HttpResult)
import Data.Document exposing (Document, DocumentID)
import Dom
import Mouse
import Keyboard


type Msg
    = None
    | LoadDocuments (HttpResult (List Document))
    | DocumentCreated (HttpResult Document)
    | CreateDocument
    | DeleteDocument DocumentID
    | DocumentDeleted (HttpResult Document)
    | DocumentRenamed (HttpResult Document)
    | FocusOn Document
    | FocusResult (Result Dom.Error ())
    | TitleInputChange String
    | UnfocusTitle
    | Select DocumentID
    | Unselect
    | FocusSelected
    | DeleteSelected
    | MouseEvent Mouse.Position
    | KeyboardEvent Keyboard.KeyCode
    | Refresh
