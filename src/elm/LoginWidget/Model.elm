module LoginWidget.Model exposing (LoginStatus(..), Model, loginCallback, logoutCallback)

import Data.Login exposing (LoginMethod(..), getLoginMethodString)
import Data.User exposing (User)
import Url exposing (percentEncode)
import Util exposing (Flags)


type LoginStatus
    = Loading
    | NotLoggedIn
    | LoggedInAs User


type alias Model =
    { status : LoginStatus
    , flags : Flags
    }


loginCallback : Flags -> LoginMethod -> String
loginCallback flags method =
    flags.seriatim_server_url
        ++ "login/"
        ++ getLoginMethodString method
        ++ "?url="
        ++ (percentEncode <| flags.seriatim_client_url ++ "documents")


logoutCallback : Flags -> String
logoutCallback flags =
    flags.seriatim_server_url
        ++ "login/logout?url="
        ++ percentEncode flags.seriatim_client_url
