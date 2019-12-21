module Model exposing (Model, init)

import Browser.Navigation as Nav
import DocumentList.HttpRequests exposing (loadDocumentsRequest)
import DocumentList.Message exposing (Msg(..))
import DocumentList.Model exposing (PageStatus(..))
import LoginWidget.HttpRequests exposing (getLoggedInUser)
import LoginWidget.Message exposing (Msg(..))
import LoginWidget.Model exposing (LoginStatus(..))
import Message exposing (Msg(..))
import Routing exposing (Route(..), parseFragment, parseLocation)
import Settings.Model exposing (Model, Setting(..))
import Url
import Util exposing (Flags)


type alias Model =
    { documentList : DocumentList.Model.Model
    , config : Flags
    , key : Nav.Key
    , route : Route
    , settings : Settings.Model.Model
    }


init : Flags -> Url.Url -> Nav.Key -> ( Model, Cmd Message.Msg )
init flags url key =
    let
        initDocList =
            { status = DocumentList.Model.Loading
            , config = flags
            , error = Nothing
            , focused = Nothing
            , selected = Nothing
            , filter = Nothing
            , documents = []
            , loadTime = Nothing
            }

        initSettings =
            { currentUser = LoginWidget.Model.Loading
            , displayName = Set
            , hasFacebookLogin = Set
            , hasTwitterLogin = Set
            , hasGoogleLogin = Set
            , config = flags
            , visible = parseFragment url == "settings"
            , error = Nothing
            }
    in
    ( { documentList = initDocList
      , config = flags
      , key = key
      , route = parseLocation url
      , settings = initSettings
      }
    , Cmd.batch
        [ loadDocumentsRequest flags.seriatim_server_url (\r -> DocumentListMessage <| LoadDocuments r)
        , getLoggedInUser flags.seriatim_server_url (\r -> LoginMessage <| Load r)
        ]
    )
