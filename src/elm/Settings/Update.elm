module Settings.Update exposing (update)

import Browser.Navigation exposing (load, pushUrl)
import Data.Login exposing (LoginMethod(..))
import LoginWidget.HttpRequests exposing (getRedirectURL, logOut)
import LoginWidget.Model exposing (LoginStatus(..))
import Message exposing (Msg(..))
import Settings.HttpRequests exposing (removeLoginRequest, renameUserRequest)
import Settings.Message exposing (Msg(..))
import Settings.Model exposing (Model, Setting(..))


resetSettings : Model -> Model
resetSettings model =
    { model
        | displayName = Set
        , hasFacebookLogin = Set
        , hasTwitterLogin = Set
        , hasGoogleLogin = Set
    }


update : Browser.Navigation.Key -> Settings.Message.Msg -> Model -> ( Model, Cmd Message.Msg )
update key msg model =
    case msg of
        LoadUser r ->
            let
                resetModel =
                    resetSettings model
            in
            case r of
                Ok (Ok u) ->
                    ( { resetModel
                        | currentUser = LoggedInAs u.data
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
            ( { model | visible = not model.visible, displayName = updatedDisplayName }, pushUrl key newHash )

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
                    , renameUserRequest model.config.seriatim_server_url curr (\r -> SettingsMessage <| LoadUser r)
                    )

                _ ->
                    ( model, Cmd.none )

        RejectName ->
            ( { model | displayName = Set }, Cmd.none )

        AddLoginMethod method ->
            let
                updatedModel =
                    case method of
                        Facebook ->
                            { model | hasFacebookLogin = Saving False }

                        Google ->
                            { model | hasGoogleLogin = Saving False }

                        Twitter ->
                            { model | hasTwitterLogin = Saving False }

                returnURL =
                    model.config.seriatim_client_url ++ "documents#settings"
            in
            ( updatedModel, getRedirectURL model.config.seriatim_server_url method returnURL True (\r -> SettingsMessage <| LoginRedirect r) )

        LoginRedirect (Ok (Ok u)) ->
            ( model, load u.data.url )

        LoginRedirect (Ok (Err e)) ->
            let
                resetModel =
                    resetSettings model
            in
            ( { resetModel | error = Just e.error }, Cmd.none )

        LoginRedirect _ ->
            let
                resetModel =
                    resetSettings model
            in
            ( { resetModel | error = Just "There was an error contacting the server." }, Cmd.none )

        RemoveLoginMethod method ->
            case model.currentUser of
                LoggedInAs u ->
                    let
                        command =
                            removeLoginRequest model.config.seriatim_server_url method (\r -> SettingsMessage <| LoadUser r)
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

        Logout ->
            ( model, logOut model.config.seriatim_server_url (\r -> Message.SettingsMessage <| LoggedOut r) )

        LoggedOut _ ->
            ( model, load model.config.seriatim_client_url )

        ClearError ->
            ( { model | error = Nothing }, Cmd.none )
