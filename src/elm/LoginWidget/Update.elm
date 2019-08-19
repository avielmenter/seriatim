module LoginWidget.Update exposing (update)

import Browser.Navigation exposing (load)
import LoginWidget.HttpRequests exposing (getRedirectURL, logOut)
import LoginWidget.Message exposing (..)
import LoginWidget.Model exposing (..)
import Message


update : Msg -> Model -> ( Model, Cmd Message.Msg )
update msg model =
    let
        server =
            model.flags.seriatim_server_url

        returnURL =
            model.flags.seriatim_client_url ++ "documents"

        logoutURL =
            model.flags.seriatim_client_url
    in
    case msg of
        GetLoginURL method ->
            ( { model | status = Loading }, getRedirectURL server method returnURL False (\r -> Message.LoginMessage <| LoginRedirect r) )

        Load (Ok (Ok u)) ->
            ( { model | status = LoggedInAs u.data }, Cmd.none )

        Load _ ->
            ( { model | status = NotLoggedIn }, Cmd.none )

        LoginRedirect (Ok (Ok r)) ->
            ( model, load r.data.url )

        LoginRedirect _ ->
            ( model, Cmd.none )

        Logout ->
            ( { model | status = Loading }, logOut server (\r -> Message.LoginMessage <| LoggedOut r) )

        LoggedOut _ ->
            ( model, load logoutURL )
