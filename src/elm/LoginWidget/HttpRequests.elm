module LoginWidget.HttpRequests exposing (..)

import Http
import SeriatimHttp exposing (..)
import Data.User exposing (User)


getLoggedInUser : String -> Http.Request (SeriatimResult User)
getLoggedInUser server =
    httpRequest GET (server ++ "user/current") Http.emptyBody (decodeSeriatimResponse decodeUser)
