module Update exposing (update)

import Browser
import Browser.Navigation as Nav
import DocumentList.Message
import DocumentList.Update
import LoginWidget.Message
import LoginWidget.Update
import Message exposing (..)
import Model exposing (..)
import Routing exposing (..)
import Settings.Message
import Settings.Update
import Url


updateDocumentList : DocumentList.Message.Msg -> Model -> ( Model, Cmd Msg )
updateDocumentList dlm model =
    let
        ( updatedDocumentList, command ) =
            DocumentList.Update.update dlm model.documentList
    in
    ( { model | documentList = updatedDocumentList }, command )


updateLogin : LoginWidget.Message.Msg -> Model -> ( Model, Cmd Msg )
updateLogin lm model =
    let
        ( updatedLogin, command ) =
            LoginWidget.Update.update lm { status = model.settings.currentUser, flags = model.config }

        settings =
            model.settings

        updatedSettings =
            { settings | currentUser = updatedLogin.status }
    in
    ( { model | settings = updatedSettings }, command )


updateSettings : Settings.Message.Msg -> Model -> ( Model, Cmd Msg )
updateSettings sm model =
    let
        ( updatedSettings, command ) =
            Settings.Update.update model.key sm model.settings
    in
    ( { model | settings = updatedSettings }, command )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        None ->
            ( model, Cmd.none )

        UrlChanged url ->
            let
                settings =
                    model.settings
            in
            ( { model
                | route = parseLocation url
                , settings =
                    { settings
                        | visible = parseFragment url == "settings"
                    }
              }
            , Cmd.none
            )

        UrlRequested urlRequest ->
            case urlRequest of
                Browser.Internal url ->
                    ( model, Nav.pushUrl model.key (Url.toString url) )

                Browser.External href ->
                    ( model, Nav.load href )

        SettingsMessage sm ->
            updateSettings sm model

        DocumentListMessage dlm ->
            updateDocumentList dlm model

        LoginMessage lm ->
            updateLogin lm model

        MouseEvent m ->
            case model.route of
                DocumentList ->
                    updateDocumentList (DocumentList.Message.MouseEvent m) model

                _ ->
                    ( model, Cmd.none )

        KeyboardEvent k ->
            case model.route of
                DocumentList ->
                    updateDocumentList (DocumentList.Message.KeyboardEvent k) model

                _ ->
                    ( model, Cmd.none )
