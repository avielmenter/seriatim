module Data.Login exposing (LoginMethod(..), RedirectURL, getLoginMethodString, getLoginMethodViewName)


type LoginMethod
    = Google
    | Facebook
    | Twitter


type alias RedirectURL =
    { url : String
    , dummy: String
    }


getLoginMethodViewName : LoginMethod -> String
getLoginMethodViewName method =
    case method of
        Google ->
            "Google"

        Twitter ->
            "Twitter"

        Facebook ->
            "Facebook"


getLoginMethodString : LoginMethod -> String
getLoginMethodString method =
    case method of
        Google ->
            "google"

        Twitter ->
            "twitter"

        Facebook ->
            "facebook"
