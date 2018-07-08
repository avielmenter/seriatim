module DocumentList.Views.LoadingRow exposing (..)

import Html exposing (..)
import Html.Attributes exposing (id)
import DocumentList.Message exposing (..)


view : Html Msg
view =
    tr [ id "loadingRow" ]
        [ td [ id "loading1" ] [ span [] [ text "........................................................." ] ]
        , td [ id "loading2" ] [ span [] [ text "......................." ] ]
        , td [ id "loading3" ] [ span [] [ text "......................." ] ]
        , td [ id "loading4" ] [ span [] [ text "" ] ]
        ]
