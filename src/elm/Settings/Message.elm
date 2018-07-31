module Settings.Message exposing (..)

import SeriatimHttp exposing (HttpResult)
import Data.User exposing (User)
import LoginWidget.Model exposing (LoginMethod)


type Msg
    = LoadUser (HttpResult User)
    | ToggleSettings
    | EditName String
    | SaveName
    | RejectName
    | RemoveLoginMethod LoginMethod
    | ClearError
