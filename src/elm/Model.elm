module Model exposing (..)

import Routing exposing (..)
import DocumentList.Message exposing (Msg(..))
import LoginWidget.Message exposing (Msg(..))
import DocumentList.HttpRequests exposing (loadDocumentsRequest)
import LoginWidget.HttpRequests exposing (getLoggedInUser)
import Http
import Message exposing (..)
import Navigation exposing (Location)
import DocumentList.Model exposing (PageStatus(..))
import LoginWidget.Model exposing (LoginStatus(..))
import Settings.Model exposing (..)
import Util exposing (Flags)


type alias Model =
    { documentList : DocumentList.Model.Model
    , config : Flags
    , route : Route
    , settings : Settings.Model.Model
    , currentUser : LoginStatus
    }


init : Flags -> Location -> ( Model, Cmd Message.Msg )
init flags location =
    let
        initDocList =
            { status = DocumentList.Model.Loading
            , config = flags
            , error = Nothing
            , focused = Nothing
            , selected = Nothing
            , documents = []
            }

        initSettings =
            { displayName = Unset
            , config = flags
            , visible = location.hash == "#settings"
            }
    in
        ( { documentList = initDocList
          , config = flags
          , route = parseLocation location
          , settings = initSettings
          , currentUser = LoginWidget.Model.Loading
          }
        , Cmd.batch
            [ Http.send (\r -> DocumentListMessage <| LoadDocuments r) (loadDocumentsRequest flags.seriatim_server_url)
            , Http.send (\r -> LoginMessage <| Load r) (getLoggedInUser flags.seriatim_server_url)
            ]
        )
