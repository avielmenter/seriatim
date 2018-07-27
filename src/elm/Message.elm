module Message exposing (..)

import DocumentList.Message as DocumentList
import Navigation exposing (Location)
import Mouse
import Keyboard


type Msg
    = None
    | OnLocationChange Location
    | DocumentListMessage DocumentList.Msg
    | MouseEvent Mouse.Position
    | KeyboardEvent Keyboard.KeyCode
