module SeriatimHttp exposing (HttpResult, Method(..), SeriatimError, SeriatimErrorCode(..), SeriatimResult, SeriatimSuccess, decodeCategory, decodeCategoryID, decodeDocument, decodeDocumentID, decodeErrorCode, decodeRedirectURL, decodeRocketDate, decodeSeriatimResponse, decodeUser, decodeUserID, httpRequest, httpRequestWithHeaders)

import Data.Category exposing (Category, CategoryID)
import Data.Document exposing (Document, DocumentID)
import Data.Login exposing (RedirectURL)
import Data.User exposing (User, UserID)
import Debug exposing (log)
import Http
import Json.Decode exposing (..)
import Json.Decode.Pipeline exposing (custom, optional, required)
import Time exposing (Posix, millisToPosix)


type SeriatimErrorCode
    = InsufficientPermissions
    | NotLoggedIn
    | TooFewLoginMethods
    | NotFound
    | DatabaseError
    | OtherError


type alias SeriatimError =
    { error : String
    , code : SeriatimErrorCode
    }


type alias SeriatimSuccess a =
    { data : a
    , timestamp : Posix
    }


type alias SeriatimResult a =
    Result SeriatimError (SeriatimSuccess a)


type alias HttpResult a =
    Result Http.Error (SeriatimResult a)


type Method
    = GET
    | POST
    | DELETE


methodToString : Method -> String
methodToString method =
    case method of
        GET ->
            "GET"

        POST ->
            "POST"

        DELETE ->
            "DELETE"


httpRequestWithHeaders : List Http.Header -> Method -> String -> Http.Body -> Decoder a -> (Result Http.Error a -> b) -> Cmd b
httpRequestWithHeaders headers method url body jsonDecoder msg =
    Http.riskyRequest
        { method = methodToString method
        , headers = headers
        , url = url
        , body = body
        , expect = Http.expectJson msg jsonDecoder
        , timeout = Nothing
        , tracker = Nothing
        }


httpRequest : Method -> String -> Http.Body -> Decoder a -> (Result Http.Error a -> b) -> Cmd b
httpRequest =
    httpRequestWithHeaders []


decodeRocketDate : Decoder Posix
decodeRocketDate =
    field "secs_since_epoch" int
        |> andThen
            (\secs -> millisToPosix (secs * 1000) |> succeed)


decodeDocumentID : Decoder DocumentID
decodeDocumentID =
    string |> andThen (\docID -> Data.Document.DocumentID docID |> succeed)


decodeUserID : Decoder UserID
decodeUserID =
    string |> andThen (\userID -> Data.User.UserID userID |> succeed)


decodeCategoryID : Decoder CategoryID
decodeCategoryID =
    string |> andThen (\catID -> Data.Category.CategoryID catID |> succeed)


decodeCategory : Decoder Category
decodeCategory =
    succeed Category
        |> required "id" decodeCategoryID
        |> required "category_name" string


decodeDocument : Decoder Document
decodeDocument =
    succeed Document
        |> required "document_id" decodeDocumentID
        |> required "root_item_id" string
        |> optional "title" string "Untitled Document"
        |> required "created_at" decodeRocketDate
        |> optional "modified_at" (Json.Decode.map Just decodeRocketDate) Nothing
        |> required "publicly_viewable" bool
        |> optional "toc_item_id" (Json.Decode.map Just string) Nothing
        |> required "categories" (list decodeCategory)


decodeRedirectURL : Decoder RedirectURL
decodeRedirectURL =
    succeed RedirectURL
        |> required "url" string


decodeUser : Decoder User
decodeUser =
    succeed User
        |> required "user_id" decodeUserID
        |> required "display_name" string
        |> optional "twitter_screen_name" (Json.Decode.map Just string) Nothing
        |> optional "google_id" (Json.Decode.map Just string) Nothing
        |> optional "facebook_id" (Json.Decode.map Just string) Nothing


decodeErrorCode : Decoder SeriatimErrorCode
decodeErrorCode =
    string
        |> andThen
            (\codeStr ->
                case codeStr of
                    "INSUFFICIENT_PERMISSIONS" ->
                        succeed InsufficientPermissions

                    "NOT_LOGGED_IN" ->
                        succeed NotLoggedIn

                    "TOO_FEW_LOGIN_METHODS" ->
                        succeed TooFewLoginMethods

                    "NOT_FOUND" ->
                        succeed NotFound

                    "DATABASE_ERROR" ->
                        succeed DatabaseError

                    _ ->
                        succeed OtherError
            )


decodeSeriatimResponse : Decoder a -> Decoder (SeriatimResult a)
decodeSeriatimResponse jsonDecoder =
    field "status" string
        |> andThen
            (\status ->
                case status of
                    "error" ->
                        field "error" string
                            |> andThen
                                (\desc ->
                                    field "code" decodeErrorCode
                                        |> andThen (\code -> succeed (Err { code = code, error = desc }))
                                )

                    "success" ->
                        field "data" jsonDecoder
                            |> andThen
                                (\data ->
                                    field "timestamp" decodeRocketDate
                                        |> andThen (\ts -> succeed (Ok { data = data, timestamp = ts }))
                                )

                    other ->
                        fail <| "Uknown response status: " ++ other
            )
