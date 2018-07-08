module Data.User exposing (..)


type UserID
    = UserID String


type alias User =
    { user_id : UserID
    , twitter_name : String
    , twitter_screen_name : String
    }
