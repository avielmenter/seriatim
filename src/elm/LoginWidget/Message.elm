module LoginWidget.Message exposing (..)

import Data.User exposing (User)
import SeriatimHttp exposing (HttpResult)


type Msg
    = Load (HttpResult User)
