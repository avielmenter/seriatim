module LoginWidget.Model exposing (..)

import Data.User exposing (User)
import Util exposing (Flags)


type LoginStatus
    = Loading
    | NotLoggedIn
    | LoggedInAs User


type alias Model =
    { status : LoginStatus
    , flags : Flags
    }
