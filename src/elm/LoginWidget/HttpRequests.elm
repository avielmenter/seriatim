module LoginWidget.HttpRequests exposing (getLoggedInUser, getRedirectURL, logOut)

import Data.Login exposing (LoginMethod(..), RedirectURL, getLoginMethodString)
import Data.User exposing (User)
import Http
import SeriatimHttp exposing (HttpResult, Method(..), decodeRedirectURL, decodeSeriatimResponse, decodeUser, httpRequest)
import Url exposing (percentEncode)


getRedirectURL : String -> LoginMethod -> String -> Bool -> (HttpResult RedirectURL -> b) -> Cmd b
getRedirectURL server loginMethod returnURL merge =
    let
        url =
            server
                ++ "login/"
                ++ getLoginMethodString loginMethod
                ++ "?url="
                ++ percentEncode returnURL
                ++ (if merge then
                        "&merge=true"

                    else
                        ""
                   )
    in
    httpRequest GET url Http.emptyBody (decodeSeriatimResponse decodeRedirectURL)


getLoggedInUser : String -> (HttpResult User -> b) -> Cmd b
getLoggedInUser server =
    httpRequest GET (server ++ "user/current") Http.emptyBody (decodeSeriatimResponse decodeUser)


logOut : String -> (HttpResult RedirectURL -> b) -> Cmd b
logOut server =
    httpRequest GET (server ++ "login/logout?url=") Http.emptyBody (decodeSeriatimResponse decodeRedirectURL)
