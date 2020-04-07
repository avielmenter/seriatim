module DocumentList.View exposing (view)

import Data.Document exposing (inArchive, inTrash)
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
        |> List.filter (\d -> (not <| inTrash d.data) && (model.documentList.showArchive || (not <| inArchive d.data)))
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


inCategory : String -> ListDocument -> Bool
inCategory cat doc =
    doc.data.categories
        |> List.filter (\c -> c.category_name == cat)
        |> List.isEmpty
        |> not


categoryFilter : Maybe String -> List ListDocument -> List ListDocument
categoryFilter category =
    case category of
        Just c ->
            List.filter (inCategory c)

        Nothing ->
            \l -> l


archiveFilter : Bool -> List ListDocument -> List ListDocument
archiveFilter showArchive =
    if not showArchive then
        List.filter (\d -> not <| inCategory "Archive" d)

    else
        \l -> l


trashFilter : Bool -> List ListDocument -> List ListDocument
trashFilter showTrash =
    if not showTrash then
        List.filter (\d -> not <| inCategory "Trash" d)

    else
        categoryFilter <| Just "Trash"


filterDocuments : Model -> List ListDocument
filterDocuments model =
    model.documentList.documents
        |> trashFilter (Maybe.withDefault "" model.documentList.filter == "Trash")
        |> archiveFilter model.documentList.showArchive
        |> categoryFilter model.documentList.filter


isSelectedInArchive : Model -> Bool
isSelectedInArchive model =
    case model.documentList.selected of
        Just selected ->
            let
                selectedDoc =
                    model.documentList.documents
                        |> List.filter (\d -> d.data.document_id == selected)
                        |> List.map (\d -> d.data)
                        |> List.head
            in
            Maybe.withDefault False <| Maybe.map inArchive selectedDoc

        Nothing ->
            False


view : Model -> Html Message.Msg
view model =
    div [ id "dlContent" ]
        [ div [ id "dlSidebar" ]
            [ ActionsView.view
                { documentSelected = model.documentList.selected
                , inTrash = Maybe.withDefault "" model.documentList.filter == "Trash"
                , inArchive = isSelectedInArchive model
                }
            , CategoriesView.view
                { categories = getCategories model
                , filter = model.documentList.filter
                , showArchive = model.documentList.showArchive
                }
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
