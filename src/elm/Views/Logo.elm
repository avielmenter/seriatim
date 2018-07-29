module Views.Logo exposing (view)

import Html exposing (Html, text)
import Html.Attributes exposing (href, class, src, alt, id)
import Message exposing (Msg)


view : Html Msg
view =
    Html.h3 []
        [ Html.a [ href "./index.html" ]
            [ Html.img [ class "mini_logo", src "./assets/logo.png", alt "logo" ] []
            , text "seriatim "
            , Html.span [ id "logo_bullet" ] [ text "•" ]
            , text " io"
            ]
        ]
