module Data.Login exposing (LoginMethod(..), RedirectURL, getLoginMethodString, getLoginMethodViewName)


type LoginMethod
    = Google
    | Facebook
    | Twitter


type alias RedirectURL =
    { url : String
    , dummy : String -- this is here just to get rid of an error regarding single-member records
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
