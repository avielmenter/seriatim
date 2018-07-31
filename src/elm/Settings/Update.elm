module Settings.Update exposing (update)

import Settings.Model exposing (..)
import Settings.Message exposing (..)
import Message exposing (..)
import LoginWidget.Model exposing (LoginStatus(..), LoginMethod(..))
import Navigation exposing (newUrl)
import Http
import Settings.HttpRequests exposing (renameUserRequest, removeLoginRequest)


resetSettings : Model -> Model
resetSettings model =
    { model
        | displayName = Set
        , hasFacebookLogin = Set
        , hasTwitterLogin = Set
        , hasGoogleLogin = Set
    }


update : Settings.Message.Msg -> Model -> ( Model, Cmd Message.Msg )
update msg model =
    case msg of
        LoadUser r ->
            let
                resetModel =
                    resetSettings model
            in
                case r of
                    Ok (Ok u) ->
                        ( { resetModel
                            | currentUser = LoggedInAs u
                            , displayName =
                                case model.displayName of
                                    Saving _ ->
                                        Saved

                                    _ ->
                                        Set
                          }
                        , Cmd.none
                        )

                    Ok (Err e) ->
                        ( { resetModel | error = Just e.error }, Cmd.none )

                    Err _ ->
                        ( { resetModel | error = Just "There was an error contacting the server." }, Cmd.none )

        ToggleSettings ->
            let
                newHash =
                    if model.visible then
                        "#"
                    else
                        "#settings"

                updatedDisplayName =
                    case model.displayName of
                        Saved ->
                            if not model.visible then
                                Set
                            else
                                model.displayName

                        _ ->
                            model.displayName
            in
                ( { model | visible = not model.visible, displayName = updatedDisplayName }, newUrl newHash )

        EditName s ->
            let
                origValue =
                    case model.currentUser of
                        LoggedInAs u ->
                            u.display_name

                        _ ->
                            ""

                updatedDisplayName =
                    if origValue == s then
                        Set
                    else
                        Editing s
            in
                ( { model | displayName = updatedDisplayName }, Cmd.none )

        SaveName ->
            case model.displayName of
                Editing curr ->
                    ( { model | displayName = Saving curr }
                    , Http.send (\r -> SettingsMessage <| LoadUser r) (renameUserRequest model.config.seriatim_server_url curr)
                    )

                _ ->
                    ( model, Cmd.none )

        RejectName ->
            ( { model | displayName = Set }, Cmd.none )

        RemoveLoginMethod method ->
            case model.currentUser of
                LoggedInAs u ->
                    let
                        command =
                            Http.send (\r -> SettingsMessage <| LoadUser r) (removeLoginRequest model.config.seriatim_server_url method)
                    in
                        case method of
                            Facebook ->
                                case u.facebook_id of
                                    Just _ ->
                                        ( { model | hasFacebookLogin = Saving False }, command )

                                    Nothing ->
                                        ( { model | hasFacebookLogin = Set }, Cmd.none )

                            Google ->
                                case u.google_id of
                                    Just _ ->
                                        ( { model | hasGoogleLogin = Saving False }, command )

                                    Nothing ->
                                        ( { model | hasGoogleLogin = Set }, Cmd.none )

                            Twitter ->
                                case u.twitter_screen_name of
                                    Just _ ->
                                        ( { model | hasTwitterLogin = Saving False }, command )

                                    Nothing ->
                                        ( { model | hasTwitterLogin = Set }, Cmd.none )

                _ ->
                    ( model, Cmd.none )

        ClearError ->
            ( { model | error = Nothing }, Cmd.none )
