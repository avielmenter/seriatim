module Message exposing (..)

import DocumentList.Message as DocumentList
import LoginWidget.Message as Login
import Settings.Message as Settings
import Navigation exposing (Location)
import Mouse
import Keyboard
import SeriatimHttp exposing (HttpResult)
import Data.User exposing (User)


type Msg
    = None
    | OnLocationChange Location
    | DocumentListMessage DocumentList.Msg
    | LoginMessage Login.Msg
    | SettingsMessage Settings.Msg
    | MouseEvent Mouse.Position
    | KeyboardEvent Keyboard.KeyCode
