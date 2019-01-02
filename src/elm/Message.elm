module Message exposing (Msg(..), keyDecoder, mouseDecoder)

import Browser
import DocumentList.Message as DocumentList
import Json.Decode as Decode
import LoginWidget.Message as Login
import Settings.Message as Settings
import Url
import Util exposing (KeyCode(..), MousePosition)


type Msg
    = None
    | UrlChanged Url.Url
    | UrlRequested Browser.UrlRequest
    | DocumentListMessage DocumentList.Msg
    | LoginMessage Login.Msg
    | SettingsMessage Settings.Msg
    | MouseEvent MousePosition
    | KeyboardEvent KeyCode


keyDecoder : Decode.Decoder Msg
keyDecoder =
    let
        toKey string =
            case string of
                "Escape" ->
                    Escape

                "Enter" ->
                    Enter

                "Return" ->
                    Enter

                _ ->
                    Other string
    in
    Decode.map (\s -> KeyboardEvent (toKey s)) (Decode.field "key" Decode.string)


mouseDecoder : Decode.Decoder Msg
mouseDecoder =
    Decode.map (\_ -> MouseEvent ()) Decode.string
