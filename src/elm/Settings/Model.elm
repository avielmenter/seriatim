module Settings.Model exposing (..)

import Util exposing (Flags)
import LoginWidget.Model exposing (LoginStatus)


type Setting a
    = Set
    | Editing a
    | Saving a
    | Saved


getSettingValue : Setting a -> a -> a
getSettingValue setting orig =
    case setting of
        Set ->
            orig

        Editing v ->
            v

        Saving v ->
            v

        Saved ->
            orig


type alias Model =
    { currentUser : LoginStatus
    , displayName : Setting String
    , hasFacebookLogin : Setting Bool
    , hasGoogleLogin : Setting Bool
    , hasTwitterLogin : Setting Bool
    , visible : Bool
    , config : Flags
    , error : Maybe String
    }
