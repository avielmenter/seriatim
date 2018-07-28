module Main exposing (..)

import Html exposing (Html, programWithFlags, text)
import Html.Attributes exposing (id, class, href, src, alt)
import Model exposing (..)
import Message exposing (..)
import Update exposing (..)
import Routing exposing (..)
import Navigation exposing (Location)
import Mouse
import Keyboard
import DocumentList.View
import Util exposing (Flags)


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ Mouse.clicks MouseEvent
        , Keyboard.downs KeyboardEvent
        ]


view : Model -> Html Msg
view model =
    Html.div []
        [ Html.header []
            [ Html.div
                [ class "headerContent flexibleContentWidth" ]
                [ Html.h3 []
                    [ Html.a [ href "./index.html" ]
                        [ Html.img [ class "mini_logo", src "./assets/logo.png", alt "logo" ] []
                        , text "seriatim "
                        , Html.span [ id "logo_bullet" ] [ text "•" ]
                        , text " io"
                        ]
                    ]
                ]
            ]
        , Html.main_ [ class "flexibleContentWidth" ]
            [ case model.route of
                DocumentList ->
                    DocumentList.View.view model

                _ ->
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
            ]
        ]


main : Program Flags Model Msg
main =
    Navigation.programWithFlags OnLocationChange
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }
