module DocumentList.Update exposing (..)

import Http
import DocumentList.Model exposing (PageStatus)
import Data.Document as Data exposing (DocumentID(..))
import DocumentList.Views.Document as Document
import DocumentList.HttpRequests exposing (..)
import DocumentList.Model exposing (..)
import DocumentList.Message exposing (Msg(..))
import Settings.Model exposing (Setting(..))
import Message exposing (..)
import SeriatimHttp exposing (HttpResult)
import Dom exposing (focus)
import Task
import Util exposing (..)
import Date


updateFromHttp : PageStatus -> (a -> Model) -> Model -> HttpResult a -> ( Model, Cmd Message.Msg )
updateFromHttp status updateModel model r =
    case r of
        Err _ ->
            ( { model | error = Just "Could not contact the server. Please try again in a minute.", status = status }, Cmd.none )

        Ok responseData ->
            case responseData of
                Err msg ->
                    ( { model | error = Just msg.error, status = status }, Cmd.none )

                Ok successResponse ->
                    let
                        updated =
                            updateModel successResponse.data
                    in
                        ( { updated
                            | error = Nothing
                            , status = Displaying
                            , loadTime = Just successResponse.timestamp
                          }
                        , Cmd.none
                        )


updateDocumentSettings : (DocumentSettings -> DocumentSettings) -> Model -> DocumentID -> Model
updateDocumentSettings updateSettings model docID =
    { model
        | documents =
            List.map
                (\d ->
                    if d.data.document_id == docID then
                        { d | settings = updateSettings d.settings }
                    else
                        d
                )
                model.documents
    }


updateSettingFromHttp : (DocumentSettings -> DocumentSettings) -> (DocumentSettings -> DocumentSettings) -> Model -> DocumentID -> HttpResult Data.Document -> ( Model, Cmd Message.Msg )
updateSettingFromHttp onSuccess onError model docID r =
    let
        updateWithError : String -> ( Model, Cmd Message.Msg )
        updateWithError errorMessage =
            ( { model
                | error = Just errorMessage
                , documents = (updateDocumentSettings onError model docID).documents
              }
            , Cmd.none
            )
    in
        case r of
            Err _ ->
                updateWithError "Could not contact the server. Please try again in a minute."

            Ok responseData ->
                case responseData of
                    Err msg ->
                        updateWithError msg.error

                    Ok data ->
                        ( updateDocumentSettings onSuccess model docID
                        , Cmd.none
                        )


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


getSelectedDocument : Model -> Maybe ListDocument
getSelectedDocument model =
    Maybe.map (\docID -> getDocumentByID docID model.documents) model.selected
        |> Maybe.withDefault Nothing


getFocusedDocument : Model -> Maybe ListDocument
getFocusedDocument model =
    Maybe.map (\( docID, _ ) -> getDocumentByID docID model.documents) model.focused
        |> Maybe.withDefault Nothing


initSettings : DocumentSettings
initSettings =
    { visible = False, publiclyViewable = Set }


update : DocumentList.Message.Msg -> Model -> ( Model, Cmd Message.Msg )
update msg model =
    case msg of
        LoadDocuments r ->
            updateFromHttp Error
                (\docs ->
                    { model
                        | documents =
                            List.sortBy .title docs
                                |> List.map (\d -> { data = d, settings = initSettings })
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
                        | documents =
                            List.sortBy (\d -> d.data.title)
                                (model.documents ++ [ { data = doc, settings = initSettings } ])
                    }
                )
                model
                r

        CopyDocument docID ->
            ( { model | status = Loading }
            , Http.send (\r -> DocumentListMessage <| DocumentCreated r) (copyDocumentRequest model.config.seriatim_server_url docID)
            )

        DeleteDocument docID ->
            ( model, Http.send (\r -> DocumentListMessage <| DocumentDeleted r) (deleteDocumentRequest model.config.seriatim_server_url docID) )

        DocumentDeleted r ->
            updateFromHttp Displaying
                (\doc ->
                    { model
                        | documents = List.filter (\d -> d.data.document_id /= doc.document_id) model.documents
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
                            List.filter (\d -> d.data.document_id /= doc.document_id) model.documents
                                |> (\l -> l ++ [ { data = doc, settings = initSettings } ])
                                |> List.sortBy (\d -> d.data.title)
                    }
                )
                model
                r

        SavePublicViewability docID publiclyViewable ->
            ( updateDocumentSettings (\s -> { s | publiclyViewable = Saving publiclyViewable }) model docID
            , Http.send
                (\r -> DocumentListMessage <| PublicViewabilitySaved docID r)
                (publicViewabilityRequest model.config.seriatim_server_url docID publiclyViewable)
            )

        PublicViewabilitySaved docID r ->
            let
                ( updatedSettingsModel, settingsCommand ) =
                    updateSettingFromHttp
                        (\s -> { s | publiclyViewable = Saved })
                        (\s -> { s | publiclyViewable = Set })
                        model
                        docID
                        r

                ( updatedModel, command ) =
                    updateFromHttp Displaying
                        (\docData ->
                            { updatedSettingsModel
                                | documents =
                                    List.map
                                        (\d ->
                                            if d.data.document_id == docData.document_id then
                                                { d | data = docData }
                                            else
                                                d
                                        )
                                        updatedSettingsModel.documents
                            }
                        )
                        updatedSettingsModel
                        r
            in
                ( updatedModel, Cmd.batch [ settingsCommand, command ] )

        TitleInputChange newTitle ->
            ( { model
                | focused = Maybe.map (\( docID, _ ) -> ( docID, newTitle )) model.focused
              }
            , Cmd.none
            )

        UnfocusTitle ->
            unfocusAndRename (DocumentListMessage msg) model

        ToggleDocumentSettings doc ->
            ( { model
                | documents =
                    List.map
                        (\d ->
                            let
                                settings =
                                    d.settings
                            in
                                { d
                                    | settings =
                                        { settings
                                            | visible =
                                                if d.data.document_id == doc.document_id then
                                                    not settings.visible
                                                else
                                                    False
                                            , publiclyViewable =
                                                case settings.publiclyViewable of
                                                    Saved ->
                                                        if d.data.document_id == doc.document_id && not settings.visible then
                                                            Set
                                                        else
                                                            Saved

                                                    _ ->
                                                        settings.publiclyViewable
                                        }
                                }
                        )
                        model.documents
              }
            , Cmd.none
            )

        Select docID ->
            ( { model | selected = Just docID }, Cmd.none )

        Unselect ->
            ( { model | selected = Nothing }, Cmd.none )

        FocusSelected ->
            case getSelectedDocument model of
                Just doc ->
                    focusOnDocument model doc.data

                Nothing ->
                    ( model, Cmd.none )

        DeleteSelected ->
            case getSelectedDocument model of
                Just doc ->
                    ( model, Http.send (\r -> DocumentListMessage <| DocumentDeleted r) (deleteDocumentRequest model.config.seriatim_server_url doc.data.document_id) )

                Nothing ->
                    ( model, Cmd.none )

        ClearError ->
            ( { model | error = Nothing, status = Displaying }, Cmd.none )

        Refresh ->
            ( { model | status = Loading }, Http.send (\r -> DocumentListMessage <| LoadDocuments r) (loadDocumentsRequest model.config.seriatim_server_url) )

        TimedRefresh refreshTime ->
            case model.loadTime of
                Nothing ->
                    update Refresh model

                Just lt ->
                    if (Date.fromTime refreshTime |> Date.minute) - (Date.minute lt) <= 1 then
                        ( model, Cmd.none )
                    else
                        update Refresh model

        DocumentList.Message.MouseEvent position ->
            if isSomething model.selected then
                case getSelectedDocument model of
                    Just selectedDoc ->
                        let
                            updatedModel =
                                updateDocumentSettings (\s -> { s | visible = False }) model selectedDoc.data.document_id
                        in
                            ( { updatedModel | selected = Nothing }, Cmd.none )

                    Nothing ->
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
                            focusOnDocument model selectedDoc.data
                        else
                            ( model, Cmd.none )

                    Nothing ->
                        ( model, Cmd.none )
