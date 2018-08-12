module DocumentList.Update exposing (..)

import Http
import DocumentList.Model exposing (PageStatus)
import Data.Document as Data exposing (DocumentID(..), inTrash)
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


updateDocumentSettings : (DocumentSettings -> DocumentSettings) -> DocumentID -> (List ListDocument -> List ListDocument)
updateDocumentSettings updateSettings docID =
    List.map
        (\d ->
            if d.data.document_id == docID then
                { d | settings = updateSettings d.settings }
            else
                d
        )


updateDocumentData : Data.Document -> (List ListDocument -> List ListDocument)
updateDocumentData doc =
    List.map
        (\d ->
            if d.data.document_id == doc.document_id then
                { data = doc, settings = d.settings }
            else
                d
        )


updateDocumentFromHttp : (DocumentSettings -> DocumentSettings) -> (DocumentSettings -> DocumentSettings) -> Model -> DocumentID -> HttpResult Data.Document -> ( Model, Cmd Message.Msg )
updateDocumentFromHttp onSuccess onError model docID r =
    let
        updateWithError : String -> ( Model, Cmd Message.Msg )
        updateWithError errorMessage =
            ( { model
                | error = Just errorMessage
                , documents = updateDocumentSettings onError docID model.documents
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
                        let
                            updatedModel =
                                { model
                                    | documents =
                                        updateDocumentData data.data model.documents
                                            |> updateDocumentSettings onSuccess data.data.document_id
                                }
                        in
                            ( updatedModel, Cmd.none )


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
    { visible = False, publiclyViewable = Set, newCategory = Set }


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
                        | documents =
                            if inTrash doc then
                                List.filter (\d -> d.data.document_id /= doc.document_id) model.documents
                            else
                                updateDocumentData doc model.documents
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
                        , documents = updateDocumentData doc model.documents
                    }
                )
                model
                r

        SavePublicViewability docID publiclyViewable ->
            ( { model | documents = updateDocumentSettings (\s -> { s | publiclyViewable = Saving publiclyViewable }) docID model.documents }
            , Http.send
                (\r -> DocumentListMessage <| PublicViewabilitySaved docID r)
                (publicViewabilityRequest model.config.seriatim_server_url docID publiclyViewable)
            )

        PublicViewabilitySaved docID r ->
            updateDocumentFromHttp
                (\s -> { s | publiclyViewable = Saved })
                (\s -> { s | publiclyViewable = Set })
                model
                docID
                r

        AddCategory docID ->
            let
                doc =
                    getDocumentByID docID model.documents
            in
                case doc of
                    Just document ->
                        let
                            category =
                                Settings.Model.getSettingValue document.settings.newCategory ""

                            alreadyInCategory =
                                document.data.categories
                                    |> List.filter (\c -> String.toLower c.category_name == String.toLower category)
                                    |> List.isEmpty
                                    |> not
                        in
                            ( { model
                                | documents =
                                    updateDocumentSettings
                                        (\s ->
                                            { s
                                                | newCategory =
                                                    if alreadyInCategory then
                                                        Saved
                                                    else
                                                        Saving category
                                            }
                                        )
                                        docID
                                        model.documents
                              }
                            , if alreadyInCategory then
                                Cmd.none
                              else
                                Http.send
                                    (\r -> DocumentListMessage <| CategoriesUpdated docID r)
                                    (addCategoryRequest model.config.seriatim_server_url docID category)
                            )

                    Nothing ->
                        ( model, Cmd.none )

        EditNewCategory docID category ->
            let
                newCategory =
                    if String.trim category /= "" then
                        Editing category
                    else
                        Set
            in
                ( { model | documents = updateDocumentSettings (\s -> { s | newCategory = newCategory }) docID model.documents }
                , Cmd.none
                )

        RejectCategory docID ->
            ( { model | documents = updateDocumentSettings (\s -> { s | newCategory = Set }) docID model.documents }, Cmd.none )

        RemoveCategory docID category ->
            let
                document =
                    getDocumentByID docID model.documents
            in
                case document of
                    Just doc ->
                        let
                            docData =
                                doc.data

                            updatedDoc =
                                { docData | categories = List.filter (\c -> c.category_name /= category) docData.categories }
                        in
                            ( { model | documents = updateDocumentData updatedDoc model.documents }
                            , Http.send
                                (\r -> DocumentListMessage <| CategoriesUpdated docID r)
                                (removeCategoryRequest model.config.seriatim_server_url docID category)
                            )

                    Nothing ->
                        ( model, Cmd.none )

        CategoriesUpdated docID r ->
            updateDocumentFromHttp
                (\s ->
                    { s
                        | newCategory =
                            case s.newCategory of
                                Saving _ ->
                                    Saved

                                _ ->
                                    Set
                    }
                )
                (\s -> { s | newCategory = Set })
                model
                docID
                r

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

        SetFilter f ->
            ( { model | filter = f }, Cmd.none )

        ClearError ->
            ( { model | error = Nothing, status = Displaying }, Cmd.none )

        Refresh displayStatus ->
            ( { model | status = displayStatus }, Http.send (\r -> DocumentListMessage <| LoadDocuments r) (loadDocumentsRequest model.config.seriatim_server_url) )

        TimedRefresh refreshTime ->
            case model.loadTime of
                Nothing ->
                    update (Refresh Displaying) model

                Just lt ->
                    if (Date.fromTime refreshTime |> Date.minute) - (Date.minute lt) <= 1 then
                        ( model, Cmd.none )
                    else
                        update (Refresh Displaying) model

        DocumentList.Message.MouseEvent position ->
            if isSomething model.selected then
                case getSelectedDocument model of
                    Just selectedDoc ->
                        ( { model
                            | selected = Nothing
                            , documents = updateDocumentSettings (\s -> { s | visible = False }) selectedDoc.data.document_id model.documents
                          }
                        , Cmd.none
                        )

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
