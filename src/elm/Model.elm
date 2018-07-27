module Model exposing (..)

import Routing exposing (..)
import DocumentList.Message exposing (Msg(..))
import DocumentList.HttpRequests exposing (loadDocumentsRequest)
import Http
import Message exposing (..)
import Navigation exposing (Location)
import DocumentList.Model exposing (PageStatus(..))
import Data.User exposing (User)
import Util exposing (Flags)


type alias Model =
    { documentList : DocumentList.Model.Model
    , currentUser : Maybe User
    , config : Flags
    , route : Route
    }


init : Flags -> Location -> ( Model, Cmd Message.Msg )
init flags location =
    let
        initDocList =
            { status = Loading
            , error = Nothing
            , focused = Nothing
            , selected = Nothing
            , documents = []
            }
    in
        ( { documentList = initDocList
          , currentUser = Nothing
          , config = flags
          , route = parseLocation location
          }
        , Http.send (\r -> DocumentListMessage <| LoadDocuments r) (loadDocumentsRequest flags.seriatim_server_url)
        )
