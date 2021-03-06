module DocumentList.Views.DocumentTableHeader exposing (view)

import Html exposing (Html, span, td, text)
import Message exposing (Msg)


view : Html Msg
view =
    Html.tr []
        [ Html.td [] [ Html.span [] [ text "Title" ] ]
        , Html.td [] [ Html.span [] [ text "Created" ] ]
        , Html.td [] [ Html.span [] [ text "Last Modified" ] ]
        , Html.td [] [ Html.span [] [ text "" ] ]
        ]
