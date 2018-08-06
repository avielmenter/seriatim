module Views.MaterialIcon exposing (view)

import Html exposing (Html, i, text)
import Html.Attributes exposing (class)
import Message exposing (Msg(..))


type alias Model =
    String


view : Model -> Html Msg
view icon =
    i [ class "material-icons" ] [ text icon ]
