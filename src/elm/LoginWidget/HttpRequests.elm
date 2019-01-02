module LoginWidget.HttpRequests exposing (getLoggedInUser)

import Data.User exposing (User)
import Http
import SeriatimHttp exposing (..)


getLoggedInUser : String -> (HttpResult User -> b) -> Cmd b
getLoggedInUser server =
    httpRequest GET (server ++ "user/current") Http.emptyBody (decodeSeriatimResponse decodeUser)
