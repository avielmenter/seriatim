module DocumentList.HttpRequests exposing (addCategoryRequest, copyDocumentRequest, createDocumentRequest, deleteDocumentRequest, loadDocumentsRequest, publicViewabilityRequest, removeCategoryRequest, renameDocumentRequest)

import Data.Document exposing (Document, DocumentID(..))
import Http
import Json.Decode exposing (list)
import Json.Encode exposing (bool, encode, object, string)
import SeriatimHttp exposing (..)
import Url exposing (percentEncode)


loadDocumentsRequest : String -> (HttpResult (List Document) -> b) -> Cmd b
loadDocumentsRequest server =
    httpRequest GET (server ++ "user/documents") Http.emptyBody (decodeSeriatimResponse (list decodeDocument))


createDocumentRequest : String -> (HttpResult Document -> b) -> Cmd b
createDocumentRequest server =
    httpRequest POST (server ++ "document/create") Http.emptyBody (decodeSeriatimResponse decodeDocument)


deleteDocumentRequest : String -> DocumentID -> (HttpResult Document -> b) -> Cmd b
deleteDocumentRequest server (DocumentID docID) =
    httpRequest DELETE (server ++ "document/" ++ docID) Http.emptyBody (decodeSeriatimResponse decodeDocument)


renameDocumentRequest : String -> DocumentID -> String -> (HttpResult Document -> b) -> Cmd b
renameDocumentRequest server (DocumentID docID) newName =
    let
        requestBodyJson =
            object [ ( "name", string newName ) ]

        requestBody =
            Http.jsonBody requestBodyJson
    in
    httpRequest POST (server ++ "document/" ++ docID ++ "/rename") requestBody (decodeSeriatimResponse decodeDocument)


publicViewabilityRequest : String -> DocumentID -> Bool -> (HttpResult Document -> b) -> Cmd b
publicViewabilityRequest server (DocumentID docID) publiclyViewable =
    let
        requestBodyJson =
            object [ ( "publicly_viewable", bool publiclyViewable ) ]

        requestBody =
            Http.jsonBody requestBodyJson
    in
    httpRequest POST (server ++ "document/" ++ docID ++ "/public_viewability") requestBody (decodeSeriatimResponse decodeDocument)


copyDocumentRequest : String -> DocumentID -> (HttpResult Document -> b) -> Cmd b
copyDocumentRequest server (DocumentID docID) =
    httpRequest POST (server ++ "document/" ++ docID ++ "/copy") Http.emptyBody (decodeSeriatimResponse decodeDocument)


addCategoryRequest : String -> DocumentID -> String -> (HttpResult Document -> b) -> Cmd b
addCategoryRequest server (DocumentID docID) category_name =
    let
        requestBodyJson =
            object [ ( "name", string category_name ) ]

        requestBody =
            Http.jsonBody requestBodyJson
    in
    httpRequest POST (server ++ "document/" ++ docID ++ "/categories") requestBody (decodeSeriatimResponse decodeDocument)


removeCategoryRequest : String -> DocumentID -> String -> (HttpResult Document -> b) -> Cmd b
removeCategoryRequest server (DocumentID docID) category_name =
    httpRequest
        DELETE
        (server ++ "document/" ++ docID ++ "/categories/" ++ percentEncode category_name)
        Http.emptyBody
        (decodeSeriatimResponse decodeDocument)
