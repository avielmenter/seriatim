module Data.Category exposing (Category, CategoryID(..))


type CategoryID
    = CategoryID String


type alias Category =
    { category_id : CategoryID
    , category_name : String
    }
