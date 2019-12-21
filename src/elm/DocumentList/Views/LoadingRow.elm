module DocumentList.Views.LoadingRow exposing (view)

import Html exposing (Html, span, td, text, tr)
import Html.Attributes exposing (id)
import Message exposing (Msg)


view : Html Msg
view =
    tr [ id "loadingRow" ]
        [ td [ id "loading1" ] [ span [] [ text "........................................................." ] ]
        , td [ id "loading2" ] [ span [] [ text "......................." ] ]
        , td [ id "loading3" ] [ span [] [ text "......................." ] ]
        , td [ id "loading4" ] [ span [] [ text "" ] ]
        ]
