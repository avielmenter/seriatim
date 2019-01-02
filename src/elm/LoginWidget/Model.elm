module LoginWidget.Model exposing (LoginMethod(..), LoginStatus(..), Model, getMethodString, getMethodViewName, loginCallback, logoutCallback)

import Data.User exposing (User)
import Url exposing (percentEncode)
import Util exposing (Flags)


type LoginMethod
    = Google
    | Facebook
    | Twitter


type LoginStatus
    = Loading
    | NotLoggedIn
    | LoggedInAs User


type alias Model =
    { status : LoginStatus
    , flags : Flags
    }


getMethodViewName : LoginMethod -> String
getMethodViewName method =
    case method of
        Google ->
            "Google"

        Twitter ->
            "Twitter"

        Facebook ->
            "Facebook"


getMethodString : LoginMethod -> String
getMethodString method =
    case method of
        Google ->
            "google"

        Twitter ->
            "twitter"

        Facebook ->
            "facebook"


loginCallback : Flags -> LoginMethod -> String
loginCallback flags method =
    flags.seriatim_server_url
        ++ "login/"
        ++ getMethodString method
        ++ "?url="
        ++ (percentEncode <| flags.seriatim_client_url ++ "documents")


logoutCallback : Flags -> String
logoutCallback flags =
    flags.seriatim_server_url
        ++ "login/logout?url="
        ++ percentEncode flags.seriatim_client_url
