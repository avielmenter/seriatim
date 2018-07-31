module Update exposing (update)

import Routing exposing (..)
import Message exposing (..)
import Model exposing (..)
import DocumentList.Update
import DocumentList.Message
import LoginWidget.Message
import LoginWidget.Update
import Settings.Message
import Settings.Update


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
            Settings.Update.update sm model.settings
    in
        ( { model | settings = updatedSettings }, command )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        None ->
            ( model, Cmd.none )

        OnLocationChange location ->
            let
                settings =
                    model.settings

                updatedSettings =
                    { settings | visible = location.hash == "#settings" }
            in
                ( { model
                    | route = parseLocation location
                    , settings = updatedSettings
                  }
                , Cmd.none
                )

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
