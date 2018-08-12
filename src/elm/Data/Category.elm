module Data.Category exposing (..)


type CategoryID
    = CategoryID String


type alias Category =
    { category_id : CategoryID
    , category_name : String
    }
