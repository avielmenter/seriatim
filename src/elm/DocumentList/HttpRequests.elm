module DocumentList.HttpRequests exposing (..)

import Http
import Json.Decode exposing (list)
import Json.Encode exposing (encode, object, string)
import SeriatimHttp exposing (..)
import Data.Document exposing (Document, DocumentID)


loadDocumentsRequest : String -> Http.Request (SeriatimResult (List Document))
loadDocumentsRequest server =
    httpRequest GET (server ++ "user/documents") Http.emptyBody (decodeSeriatimResponse (list decodeDocument))


createDocumentRequest : String -> Http.Request (SeriatimResult Document)
createDocumentRequest server =
    httpRequest POST (server ++ "document/create") Http.emptyBody (decodeSeriatimResponse decodeDocument)


deleteDocumentRequest : String -> DocumentID -> Http.Request (SeriatimResult Document)
deleteDocumentRequest server (Data.Document.DocumentID docID) =
    httpRequest DELETE (server ++ "document/" ++ docID) Http.emptyBody (decodeSeriatimResponse decodeDocument)


renameDocumentRequest : String -> DocumentID -> String -> Http.Request (SeriatimResult Document)
renameDocumentRequest server (Data.Document.DocumentID docID) newName =
    let
        requestBodyJson =
            object [ ( "name", string newName ) ]

        requestBody =
            Http.jsonBody requestBodyJson
    in
        httpRequest POST (server ++ "document/" ++ docID ++ "/rename") requestBody (decodeSeriatimResponse decodeDocument)
