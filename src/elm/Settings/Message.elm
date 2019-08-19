module Settings.Message exposing (Msg(..))

import Data.Login exposing (LoginMethod, RedirectURL)
import Data.User exposing (User)
import SeriatimHttp exposing (HttpResult)


type Msg
    = LoadUser (HttpResult User)
    | ToggleSettings
    | EditName String
    | SaveName
    | RejectName
    | AddLoginMethod LoginMethod
    | LoginRedirect (HttpResult RedirectURL)
    | RemoveLoginMethod LoginMethod
    | Logout
    | LoggedOut (HttpResult RedirectURL)
    | ClearError
