module LoginWidget.Model exposing (..)

import Data.User exposing (User)
import Util exposing (Flags)
import Http exposing (encodeUri)


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
        ++ (getMethodString method)
        ++ "?url="
        ++ (encodeUri <| flags.seriatim_client_url ++ "documents")


logoutCallback : Flags -> String
logoutCallback flags =
    flags.seriatim_server_url
        ++ "login/logout?url="
        ++ (encodeUri flags.seriatim_client_url)
