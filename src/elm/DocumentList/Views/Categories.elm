module DocumentList.Views.Categories exposing (view)

import DocumentList.Message exposing (Msg(..))
import DocumentList.Model exposing (SpecialFilter(..))
import Html exposing (Html, text)
import Html.Attributes exposing (class, id)
import Html.Events exposing (onClick)
import Message exposing (Msg(..))
import Views.MaterialIcon as MaterialIcon


type alias Model =
    { categories : List String
    , filter : Maybe String
    , specialFilter : SpecialFilter
    }


categoryView : String -> Bool -> Html Message.Msg
categoryView category isSelected =
    let
        filter =
            if isSelected then
                Nothing

            else
                Just category

        icon =
            if isSelected then
                "radio_button_checked"

            else
                "radio_button_unchecked"
    in
    Html.button
        [ class <|
            "categoryButton"
                ++ (if isSelected then
                        " categorySelected"

                    else
                        ""
                   )
        , onClick (DocumentListMessage <| SetFilter filter)
        ]
        [ MaterialIcon.view icon
        , text category
        ]


view : Model -> Html Message.Msg
view model =
    Html.div [ id "categories" ] <|
        [ Html.h3 [] [ text "Categories" ]
        , Html.div []
            (model.categories
                |> List.filter (\c -> c /= "Trash" && c /= "Archive")
                |> List.map (\c -> categoryView c (Maybe.withDefault "" model.filter == c))
            )
        , Html.div [ class "archiveButtonContainer" ]
            [ Html.button
                [ class <|
                    "categoryButton"
                        ++ (if model.specialFilter == Archive then
                                " categorySelected"

                            else
                                ""
                           )
                , onClick (DocumentListMessage ToggleShowArchive)
                ]
                [ MaterialIcon.view "description"
                , text "All Documents"
                ]
            ]
        , Html.div [ class "trashButtonContainer" ]
            [ Html.button
                [ class <|
                    "categoryButton"
                        ++ (if model.specialFilter == Trash then
                                " categorySelected"

                            else
                                ""
                           )
                , onClick (DocumentListMessage ToggleShowTrash)
                ]
                [ MaterialIcon.view "delete", text "Trash" ]
            ]
        ]
