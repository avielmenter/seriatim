module Settings.HttpRequests exposing (removeLoginRequest, renameUserRequest)

import Data.User exposing (User)
import Http
import Json.Encode exposing (encode, object, string)
import LoginWidget.Model exposing (LoginMethod(..), getMethodString)
import SeriatimHttp exposing (..)


renameUserRequest : String -> String -> (HttpResult User -> b) -> Cmd b
renameUserRequest server newName =
    let
        requestBodyJson =
            object [ ( "display_name", string newName ) ]

        requestBody =
            Http.jsonBody requestBodyJson
    in
    httpRequest POST (server ++ "user/update") requestBody (decodeSeriatimResponse decodeUser)


removeLoginRequest : String -> LoginMethod -> (HttpResult User -> b) -> Cmd b
removeLoginRequest server method =
    let
        url =
            server ++ "user/remove_login/" ++ getMethodString method
    in
    httpRequest POST url Http.emptyBody (decodeSeriatimResponse decodeUser)
