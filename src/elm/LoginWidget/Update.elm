module LoginWidget.Update exposing (update)

import Message
import LoginWidget.Message exposing (..)
import LoginWidget.Model exposing (..)


update : Msg -> Model -> ( Model, Cmd Message.Msg )
update msg model =
    case msg of
        Load (Ok (Ok u)) ->
            ( { model | status = LoggedInAs u }, Cmd.none )

        Load _ ->
            ( { model | status = NotLoggedIn }, Cmd.none )
