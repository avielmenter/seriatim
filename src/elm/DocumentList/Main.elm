module DocumentList.Main exposing (..)

import Html exposing (Html, div, text, programWithFlags)
import Html.Attributes exposing (id)
import Html.Events exposing (onClick)
import Http
import Data.Document as Data
import DocumentList.Views.Document as Document
import DocumentList.Views.Actions as ActionsView
import DocumentList.Views.DocumentList as DLView
import DocumentList.Message exposing (..)
import DocumentList.HttpRequests exposing (..)
import Dom exposing (focus)
import Task
import Mouse
import Keyboard
import Util exposing (..)


type PageStatus
    = Loading
    | Displaying
    | Error


type alias Model =
    { status : PageStatus
    , config : Flags
    , error : Maybe String
    , focused : Maybe ( Data.DocumentID, String )
    , selected : Maybe Data.DocumentID
    , documents : List Data.Document
    }


init : Flags -> ( Model, Cmd Msg )
init flags =
    ( { status = Loading
      , config = flags
      , error = Nothing
      , focused = Nothing
      , selected = Nothing
      , documents = []
      }
    , Http.send LoadDocuments (loadDocumentsRequest flags.seriatim_server_url)
    )


view : Model -> Html Msg
view model =
    div [ id "dlContent" ]
        [ ActionsView.view { documentSelected = isSomething model.selected }
        , case model.status of
            Loading ->
                text "Loading..."

            Error ->
                case model.error of
                    Just msg ->
                        text ("ERROR: " ++ msg)

                    Nothing ->
                        text ("An unknown error has occurred")

            Displaying ->
                div [ id "documentList" ]
                    ((case model.error of
                        Just msg ->
                            [ div [ id "error" ] [ text msg ] ]

                        Nothing ->
                            []
                     )
                        ++ [ Html.h3 []
                                [ text "Documents"
                                , Html.span [ onClick Refresh, id "refresh" ] []
                                ]
                           , DLView.view { focused = model.focused, selected = model.selected, documents = model.documents }
                           ]
                    )
        ]


updateFromHttp : PageStatus -> (a -> Model) -> Model -> HttpResult a -> ( Model, Cmd Msg )
updateFromHttp status updateModel model r =
    case r of
        Err _ ->
            ( { model | error = Just "HTTP Error", status = status }, Cmd.none )

        Ok responseData ->
            case responseData of
                Err msg ->
                    ( { model | error = Just msg, status = status }, Cmd.none )

                Ok data ->
                    let
                        updated =
                            updateModel data
                    in
                        ( { updated | error = Nothing, status = Displaying }, Cmd.none )


unfocusAndRename : Msg -> Model -> ( Model, Cmd Msg )
unfocusAndRename msg model =
    case model.focused of
        Just ( docID, docTitle ) ->
            ( { model | focused = Nothing }
            , Http.send DocumentRenamed (renameDocumentRequest model.config.seriatim_server_url docID docTitle)
            )

        Nothing ->
            ( model, Cmd.none )


focusOnDocument : Model -> Data.Document -> ( Model, Cmd Msg )
focusOnDocument model doc =
    ( { model | focused = Just ( doc.document_id, doc.title ) }
    , Task.attempt FocusResult (focus (Document.inputID doc.document_id))
    )


getSelectedDocument : Model -> Maybe Data.Document
getSelectedDocument model =
    Maybe.map (\docID -> Data.getDocumentByID docID model.documents) model.selected
        |> Maybe.withDefault Nothing


getFocusedDocument : Model -> Maybe Data.Document
getFocusedDocument model =
    Maybe.map (\( docID, _ ) -> Data.getDocumentByID docID model.documents) model.focused
        |> Maybe.withDefault Nothing


update : Msg -> Model -> ( Model, Cmd Msg )
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
            , Http.send DocumentCreated (createDocumentRequest model.config.seriatim_server_url)
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
            ( model, Http.send DocumentDeleted (deleteDocumentRequest model.config.seriatim_server_url docID) )

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
                    ( { model | error = Just "Could not rename the selected document.", focused = Nothing }, Cmd.none )

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
            unfocusAndRename msg model

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
                    ( model, Http.send DocumentDeleted (deleteDocumentRequest model.config.seriatim_server_url doc.document_id) )

                Nothing ->
                    ( model, Cmd.none )

        Refresh ->
            ( model, Http.send LoadDocuments (loadDocumentsRequest model.config.seriatim_server_url) )

        MouseEvent position ->
            if isSomething model.selected then
                ( { model | selected = Nothing }, Cmd.none )
            else
                ( model, Cmd.none )

        KeyboardEvent keyCode ->
            if isSomething model.focused then
                if keyCode == 27 || keyCode == 13 then
                    -- esc or enter key
                    unfocusAndRename msg model
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

        None ->
            ( model, Cmd.none )


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ Mouse.clicks MouseEvent
        , Keyboard.downs KeyboardEvent
        ]


type alias Flags =
    { seriatim_client_url : String
    , seriatim_server_url : String
    }


main : Program Flags Model Msg
main =
    programWithFlags
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }
