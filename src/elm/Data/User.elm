module Data.User exposing (..)


type UserID
    = UserID String


type alias User =
    { user_id : UserID
    , display_name : String
    , twitter_screen_name : Maybe String
    , google_id : Maybe String
    , facebook_id : Maybe String
    }
