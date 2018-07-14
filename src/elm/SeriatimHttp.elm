module SeriatimHttp exposing (..)

import Http
import Json.Decode exposing (..)
import Json.Decode.Pipeline exposing (decode, required, optional, custom)
import Data.Document exposing (Document, DocumentID)
import Data.User exposing (User, UserID)
import Date exposing (Date)


type alias SeriatimResult a =
    Result String a


type alias HttpResult a =
    Result Http.Error (SeriatimResult a)


type Method
    = GET
    | POST
    | DELETE


httpRequestWithHeaders : List Http.Header -> Method -> String -> Http.Body -> Decoder a -> Http.Request a
httpRequestWithHeaders headers method url body jsonDecoder =
    Http.request
        { method = toString method
        , headers = headers
        , url = url
        , body = body
        , expect = Http.expectJson jsonDecoder
        , timeout = Nothing
        , withCredentials = True
        }


httpRequest : Method -> String -> Http.Body -> Decoder a -> Http.Request a
httpRequest =
    httpRequestWithHeaders []


decodeRocketDate : Decoder Date
decodeRocketDate =
    (field "secs_since_epoch" int)
        |> andThen
            (\secs ->
                secs
                    * 1000
                    |> toFloat
                    |> Date.fromTime
                    |> succeed
            )


decodeDocumentID : Decoder DocumentID
decodeDocumentID =
    string |> andThen (\docID -> Data.Document.DocumentID docID |> succeed)


decodeUserID : Decoder UserID
decodeUserID =
    string |> andThen (\userID -> Data.User.UserID userID |> succeed)


decodeDocument : Decoder Document
decodeDocument =
    decode Document
        |> required "document_id" decodeDocumentID
        |> required "root_item_id" string
        |> optional "title" string "Untitled Document"
        |> required "created_at" decodeRocketDate
        |> optional "modified_at" (Json.Decode.map Just decodeRocketDate) Nothing


decodeUser : Decoder User
decodeUser =
    decode User
        |> required "user_id" decodeUserID
        |> required "display_name" string
        |> optional "twitter_screen_name" (Json.Decode.map Just string) Nothing
        |> optional "google_id" (Json.Decode.map Just string) Nothing
        |> optional "facebook_id" (Json.Decode.map Just string) Nothing


decodeSeriatimResponse : Decoder a -> Decoder (SeriatimResult a)
decodeSeriatimResponse jsonDecoder =
    (field "status" string)
        |> andThen
            (\status ->
                case status of
                    "error" ->
                        (field "error" string)
                            |> andThen (\error -> succeed (Err error))

                    "success" ->
                        (field "data" jsonDecoder)
                            |> andThen (\data -> succeed (Ok data))

                    other ->
                        fail <| "Uknown response status: " ++ other
            )
