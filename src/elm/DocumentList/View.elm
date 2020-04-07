module DocumentList.View exposing (view)

import Data.Document exposing (inTrash)
import DocumentList.Message exposing (Msg(..))
import DocumentList.Model exposing (ListDocument, PageStatus(..))
import DocumentList.Views.Actions as ActionsView
import DocumentList.Views.Categories as CategoriesView
import DocumentList.Views.DocumentList as DLView
import DocumentList.Views.DocumentTableHeader as TableHeader
import DocumentList.Views.ErrorMessage as ErrorMessage
import DocumentList.Views.LoadingRow as LoadingRow
import Html exposing (Html, div, text)
import Html.Attributes exposing (id)
import Html.Events exposing (onClick)
import Message exposing (Msg(..))
import Model exposing (Model)
import Set
import Views.MaterialIcon as MaterialIcon


getCategories : Model -> List String
getCategories model =
    model.documentList.documents
        |> List.filter (\d -> inTrash d.data)
        -- [Document]   -> [Document]
        |> List.map (\d -> d.data.categories)
        -- [Document]   -> [[Category]]
        |> List.foldl (++) []
        -- [[Category]] -> [Category]
        |> List.map (\c -> c.category_name)
        -- [Category]   -> [String]
        |> Set.fromList
        -- [String]     -> Set String   (for duplicate removal)
        |> Set.toList
        -- Set String   -> [string]     (for sorting)
        |> List.sort


filterDocuments : Model -> List ListDocument
filterDocuments model =
    let
        inCategory : String -> ListDocument -> Bool
        inCategory cat doc =
            doc.data.categories
                |> List.filter (\c -> c.category_name == cat)
                |> List.isEmpty
                |> not
    in
    case model.documentList.filter of
        Just category ->
            List.filter (inCategory category) model.documentList.documents

        Nothing ->
            List.filter (\d -> not (inCategory "Trash" d)) model.documentList.documents


view : Model -> Html Message.Msg
view model =
    div [ id "dlContent" ]
        [ div [ id "dlSidebar" ]
            [ ActionsView.view { documentSelected = model.documentList.selected, inTrash = Maybe.withDefault "" model.documentList.filter == "Trash" }
            , CategoriesView.view { categories = getCategories model, filter = model.documentList.filter }
            ]
        , div [ id "documentList" ]
            ((Html.h3 [] <|
                [ text "Documents"
                , Html.span
                    [ onClick <| DocumentListMessage (Refresh Loading)
                    , id "refresh"
                    ]
                    [ MaterialIcon.view "cached" ]
                ]
             )
                :: (case model.documentList.status of
                        Displaying ->
                            (Maybe.map (\err -> [ ErrorMessage.view <| "ERROR: " ++ err ]) model.documentList.error
                                |> Maybe.withDefault []
                            )
                                ++ [ DLView.view
                                        { focused = model.documentList.focused
                                        , selected = model.documentList.selected
                                        , documents = filterDocuments model
                                        , loadTime = model.documentList.loadTime
                                        }
                                   ]

                        Loading ->
                            [ Html.table [ id "documents" ]
                                (TableHeader.view
                                    :: (List.range 0 2 |> List.map (\_ -> LoadingRow.view))
                                )
                            ]

                        Error ->
                            [ ErrorMessage.view <| "ERROR: " ++ Maybe.withDefault "An unknown error has occurred" model.documentList.error
                            , Html.table [ id "documents" ] [ TableHeader.view ]
                            ]
                   )
            )
        ]
