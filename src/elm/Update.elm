module Update exposing (..)

import Routing exposing (..)
import Message exposing (..)
import Model exposing (..)
import DocumentList.Update
import DocumentList.Message


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        None ->
            ( model, Cmd.none )

        OnLocationChange location ->
            ( { model | route = parseLocation location }, Cmd.none )

        DocumentListMessage dlm ->
            DocumentList.Update.update dlm model

        MouseEvent m ->
            case model.route of
                DocumentList ->
                    DocumentList.Update.update (DocumentList.Message.MouseEvent m) model

                _ ->
                    ( model, Cmd.none )

        KeyboardEvent k ->
            case model.route of
                DocumentList ->
                    DocumentList.Update.update (DocumentList.Message.KeyboardEvent k) model

                _ ->
                    ( model, Cmd.none )
