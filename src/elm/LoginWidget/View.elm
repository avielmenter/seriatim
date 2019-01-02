module LoginWidget.View exposing (view)

import Html exposing (..)
import Html.Attributes exposing (class, href, id)
import LoginWidget.Model exposing (..)
import Message exposing (Msg(..))
import Views.LoadingSpinner as LoadingSpinner


view : Model -> Html Msg
view model =
    div [ id "login" ]
        (case model.status of
            NotLoggedIn ->
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
                [ LoadingSpinner.view ]
        )
