module DocumentList.Update exposing (..)

import Http
import DocumentList.Model exposing (PageStatus)
import Data.Document as Data
import DocumentList.Views.Document as Document
import DocumentList.HttpRequests exposing (..)
import DocumentList.Model exposing (PageStatus(..), Model)
import DocumentList.Message exposing (Msg(..))
import Message exposing (..)
import SeriatimHttp exposing (HttpResult)
import Dom exposing (focus)
import Task
import Mouse
import Keyboard
import Util exposing (..)


updateFromHttp : PageStatus -> (a -> Model) -> Model -> HttpResult a -> ( Model, Cmd Message.Msg )
updateFromHttp status updateModel model r =
    case r of
        Err _ ->
            ( { model | error = Just "Could not contact the server. Please try again in a few minutes.", status = status }, Cmd.none )

        Ok responseData ->
            case responseData of
                Err msg ->
                    ( { model | error = Just msg.error, status = status }, Cmd.none )

                Ok data ->
                    let
                        updated =
                            updateModel data
                    in
                        ( { updated | error = Nothing, status = Displaying }, Cmd.none )


unfocusAndRename : Message.Msg -> Model -> ( Model, Cmd Message.Msg )
unfocusAndRename msg model =
    case model.focused of
        Just ( docID, docTitle ) ->
            ( { model | focused = Nothing }
            , Http.send (\r -> DocumentListMessage <| DocumentRenamed r) (renameDocumentRequest model.config.seriatim_server_url docID docTitle)
            )

        Nothing ->
            ( model, Cmd.none )


focusOnDocument : Model -> Data.Document -> ( Model, Cmd Message.Msg )
focusOnDocument model doc =
    ( { model | focused = Just ( doc.document_id, doc.title ) }
    , Task.attempt (\r -> DocumentListMessage <| FocusResult r) (focus (Document.inputID doc.document_id))
    )


getSelectedDocument : Model -> Maybe Data.Document
getSelectedDocument model =
    Maybe.map (\docID -> Data.getDocumentByID docID model.documents) model.selected
        |> Maybe.withDefault Nothing


getFocusedDocument : Model -> Maybe Data.Document
getFocusedDocument model =
    Maybe.map (\( docID, _ ) -> Data.getDocumentByID docID model.documents) model.focused
        |> Maybe.withDefault Nothing


update : DocumentList.Message.Msg -> Model -> ( Model, Cmd Message.Msg )
update msg model =
    case msg of
        LoadDocuments r ->
            updateFromHttp Error
                (\docs ->
                    { model
                        | documents = List.sortBy .title docs
                    }
                )
                model
                r

        CreateDocument ->
            ( { model | status = Loading }
            , Http.send (\r -> DocumentListMessage <| DocumentCreated r) (createDocumentRequest model.config.seriatim_server_url)
            )

        DocumentCreated r ->
            updateFromHttp Displaying
                (\doc ->
                    { model
                        | documents = List.sortBy .title (model.documents ++ [ doc ])
                    }
                )
                model
                r

        DeleteDocument docID ->
            ( model, Http.send (\r -> DocumentListMessage <| DocumentDeleted r) (deleteDocumentRequest model.config.seriatim_server_url docID) )

        DocumentDeleted r ->
            updateFromHttp Displaying
                (\doc ->
                    { model
                        | documents = List.filter (\d -> d.document_id /= doc.document_id) model.documents
                    }
                )
                model
                r

        FocusOn doc ->
            focusOnDocument model doc

        FocusResult result ->
            case result of
                Err (Dom.NotFound id) ->
                    ( { model
                        | error = Just "Could not rename the selected document."
                        , focused = Nothing
                      }
                    , Cmd.none
                    )

                Ok () ->
                    ( model, Cmd.none )

        DocumentRenamed r ->
            updateFromHttp Displaying
                (\doc ->
                    { model
                        | focused = Nothing
                        , documents =
                            List.filter (\d -> d.document_id /= doc.document_id) model.documents
                                |> (\l -> l ++ [ doc ])
                                |> List.sortBy .title
                    }
                )
                model
                r

        TitleInputChange newTitle ->
            ( { model
                | focused = Maybe.map (\( docID, _ ) -> ( docID, newTitle )) model.focused
              }
            , Cmd.none
            )

        UnfocusTitle ->
            unfocusAndRename (DocumentListMessage msg) model

        Select docID ->
            ( { model | selected = Just docID }, Cmd.none )

        Unselect ->
            ( { model | selected = Nothing }, Cmd.none )

        FocusSelected ->
            case getSelectedDocument model of
                Just doc ->
                    focusOnDocument model doc

                Nothing ->
                    ( model, Cmd.none )

        DeleteSelected ->
            case getSelectedDocument model of
                Just doc ->
                    ( model, Http.send (\r -> DocumentListMessage <| DocumentDeleted r) (deleteDocumentRequest model.config.seriatim_server_url doc.document_id) )

                Nothing ->
                    ( model, Cmd.none )

        ClearError ->
            ( { model | error = Nothing, status = Displaying }, Cmd.none )

        Refresh ->
            ( { model | status = Loading }, Http.send (\r -> DocumentListMessage <| LoadDocuments r) (loadDocumentsRequest model.config.seriatim_server_url) )

        DocumentList.Message.MouseEvent position ->
            if isSomething model.selected then
                ( { model | selected = Nothing }, Cmd.none )
            else
                ( model, Cmd.none )

        DocumentList.Message.KeyboardEvent keyCode ->
            if isSomething model.focused then
                if keyCode == 27 || keyCode == 13 then
                    -- esc or enter key
                    unfocusAndRename (DocumentListMessage msg) model
                else
                    ( model, Cmd.none )
            else
                case getSelectedDocument model of
                    Just selectedDoc ->
                        if keyCode == 27 then
                            -- esc key
                            ( { model | selected = Nothing }, Cmd.none )
                        else if keyCode == 13 then
                            -- enter key
                            focusOnDocument model selectedDoc
                        else
                            ( model, Cmd.none )

                    Nothing ->
                        ( model, Cmd.none )

        DocumentList.Message.None ->
            ( model, Cmd.none )
