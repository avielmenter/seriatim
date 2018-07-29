module Views.NotFound exposing (view)

import Html exposing (Html, text)
import Html.Attributes exposing (id, class, href)
import Message exposing (Msg(..))


type alias Model =
    {}


view : Model -> Html Msg
view model =
    Html.div
        [ id "msg404" ]
        [ Html.h2 []
            [ Html.em [] [ text "Oops! " ]
            ]
        , Html.h3 []
            [ text "We could not find a URL at the specified path. Click "
            , Html.a [ href "/" ] [ text "here" ]
            , text " to return home."
            ]
        ]
