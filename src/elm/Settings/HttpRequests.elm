module Settings.HttpRequests exposing (..)

import Http
import Json.Encode exposing (encode, object, string)
import SeriatimHttp exposing (..)
import Data.User exposing (User)
import LoginWidget.Model exposing (LoginMethod(..), getMethodString)


renameUserRequest : String -> String -> Http.Request (SeriatimResult User)
renameUserRequest server newName =
    let
        requestBodyJson =
            object [ ( "display_name", string newName ) ]

        requestBody =
            Http.jsonBody requestBodyJson
    in
        httpRequest POST (server ++ "user/update") requestBody (decodeSeriatimResponse decodeUser)


removeLoginRequest : String -> LoginMethod -> Http.Request (SeriatimResult User)
removeLoginRequest server method =
    let
        url =
            server ++ "user/remove_login/" ++ (getMethodString method)
    in
        httpRequest POST url Http.emptyBody (decodeSeriatimResponse decodeUser)
