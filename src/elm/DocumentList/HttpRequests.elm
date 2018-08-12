module DocumentList.HttpRequests exposing (..)

import Http
import Json.Decode exposing (list)
import Json.Encode exposing (encode, object, string, bool)
import SeriatimHttp exposing (..)
import Data.Document exposing (Document, DocumentID(..))


loadDocumentsRequest : String -> Http.Request (SeriatimResult (List Document))
loadDocumentsRequest server =
    httpRequest GET (server ++ "user/documents") Http.emptyBody (decodeSeriatimResponse (list decodeDocument))


createDocumentRequest : String -> Http.Request (SeriatimResult Document)
createDocumentRequest server =
    httpRequest POST (server ++ "document/create") Http.emptyBody (decodeSeriatimResponse decodeDocument)


deleteDocumentRequest : String -> DocumentID -> Http.Request (SeriatimResult Document)
deleteDocumentRequest server (DocumentID docID) =
    httpRequest DELETE (server ++ "document/" ++ docID) Http.emptyBody (decodeSeriatimResponse decodeDocument)


renameDocumentRequest : String -> DocumentID -> String -> Http.Request (SeriatimResult Document)
renameDocumentRequest server (DocumentID docID) newName =
    let
        requestBodyJson =
            object [ ( "name", string newName ) ]

        requestBody =
            Http.jsonBody requestBodyJson
    in
        httpRequest POST (server ++ "document/" ++ docID ++ "/rename") requestBody (decodeSeriatimResponse decodeDocument)


publicViewabilityRequest : String -> DocumentID -> Bool -> Http.Request (SeriatimResult Document)
publicViewabilityRequest server (DocumentID docID) publiclyViewable =
    let
        requestBodyJson =
            object [ ( "publicly_viewable", bool publiclyViewable ) ]

        requestBody =
            Http.jsonBody requestBodyJson
    in
        httpRequest POST (server ++ "document/" ++ docID ++ "/public_viewability") requestBody (decodeSeriatimResponse decodeDocument)


copyDocumentRequest : String -> DocumentID -> Http.Request (SeriatimResult Document)
copyDocumentRequest server (DocumentID docID) =
    httpRequest POST (server ++ "document/" ++ docID ++ "/copy") Http.emptyBody (decodeSeriatimResponse decodeDocument)


addCategoryRequest : String -> DocumentID -> String -> Http.Request (SeriatimResult Document)
addCategoryRequest server (DocumentID docID) category_name =
    let
        requestBodyJson =
            object [ ( "name", string category_name ) ]

        requestBody =
            Http.jsonBody requestBodyJson
    in
        httpRequest POST (server ++ "document/" ++ docID ++ "/categories") requestBody (decodeSeriatimResponse decodeDocument)


removeCategoryRequest : String -> DocumentID -> String -> Http.Request (SeriatimResult Document)
removeCategoryRequest server (DocumentID docID) category_name =
    httpRequest
        DELETE
        (server ++ "document/" ++ docID ++ "/categories/" ++ (Http.encodeUri category_name))
        Http.emptyBody
        (decodeSeriatimResponse decodeDocument)
