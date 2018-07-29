module Settings.Model exposing (..)

import Util exposing (Flags)


type Setting a
    = Set a
    | Editing a a
    | Saving a a
    | Saved a
    | Unset


getSettingValue : Setting a -> Maybe a
getSettingValue setting =
    case setting of
        Set v ->
            Just v

        Editing v _ ->
            Just v

        Saving v _ ->
            Just v

        Saved v ->
            Just v

        Unset ->
            Nothing


getOriginalValue : Setting a -> Maybe a
getOriginalValue setting =
    case setting of
        Set v ->
            Just v

        Editing _ v ->
            Just v

        Saving _ v ->
            Just v

        Saved v ->
            Just v

        Unset ->
            Nothing


type alias Model =
    { displayName : Setting String
    , visible : Bool
    , config : Flags
    }
