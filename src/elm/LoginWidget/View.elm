module LoginWidget.View exposing (view)

import Html exposing (..)
import Html.Attributes exposing (href, id, class)
import Message exposing (Msg(..))
import LoginWidget.Model exposing (..)
import Views.LoadingSpinner as LoadingSpinner


view : Model -> Html Msg
view model =
    case model.status of
        NotLoggedIn ->
            div []
                [ p [] [ text "Access Seriatim using your preferred social media account:" ]
                , a
                    [ href <| loginCallback model.flags Twitter
                    , id "loginTwitter"
                    , class "login"
                    ]
                    [ text "Login via Twitter" ]
                , a
                    [ href <| loginCallback model.flags Google
                    , id "loginGoogle"
                    , class "login"
                    ]
                    [ text "Login via Google" ]
                , a
                    [ href <| loginCallback model.flags Facebook
                    , id "loginFacebook"
                    , class "login"
                    ]
                    [ text "Login via Facebook" ]
                ]

        LoggedInAs u ->
            div []
                [ p [] [ text <| "Welcome, " ++ u.display_name ++ "!" ]
                , a [ href "/documents", id "viewDocuments", class "login" ]
                    [ text "View Your Documents" ]
                , p [ id "logoutMessage" ]
                    [ text "Not you? "
                    , a
                        [ href <| logoutCallback model.flags
                        , id "logout"
                        ]
                        [ text "log out" ]
                    , text "."
                    ]
                ]

        _ ->
            LoadingSpinner.view
