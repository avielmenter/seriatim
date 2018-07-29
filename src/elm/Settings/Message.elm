module Settings.Message exposing (..)

import LoginWidget.Model exposing (LoginStatus)


type Msg
    = LoadUser LoginStatus
    | ToggleSettings
    | EditName String
    | SaveName
    | RejectName
