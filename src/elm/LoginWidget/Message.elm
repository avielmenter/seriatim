module LoginWidget.Message exposing (Msg(..))

import Data.Login exposing (LoginMethod, RedirectURL)
import Data.User exposing (User)
import SeriatimHttp exposing (HttpResult)


type Msg
    = Load (HttpResult User)
    | GetLoginURL LoginMethod
    | LoginRedirect (HttpResult RedirectURL)
    | Logout
    | LoggedOut (HttpResult RedirectURL)
