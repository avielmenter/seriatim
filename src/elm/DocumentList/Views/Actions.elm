module DocumentList.Views.Actions exposing (view)

import Html exposing (Html, text)
import Html.Attributes exposing (id, class)
import Html.Events exposing (onClick)
import DocumentList.Message exposing (..)


type alias Model =
    { documentSelected : Bool
    }


view : Model -> Html Msg
view model =
    Html.div [ id "actions" ]
        [ Html.h3 [] [ text "Actions" ]
        , Html.button
            [ id "createDocument"
            , onClick CreateDocument
            ]
            [ text "Create"
            ]
        , Html.button
            ([ id "renameDocument"
             ]
                ++ (if model.documentSelected then
                        [ onClick FocusSelected ]
                    else
                        [ class "disabled" ]
                   )
            )
            [ text "Rename"
            ]
        , Html.button
            ([ id "deleteDocument"
             ]
                ++ (if model.documentSelected then
                        [ onClick DeleteSelected ]
                    else
                        [ class "disabled" ]
                   )
            )
            [ text "Delete"
            ]
        ]
