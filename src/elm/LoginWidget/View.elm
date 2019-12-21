module LoginWidget.View exposing (view)

import Data.Login exposing (LoginMethod(..))
import Html exposing (Html, a, div, p, span, text)
import Html.Attributes exposing (class, href, id)
import Html.Events exposing (onClick)
import LoginWidget.Message exposing (Msg(..))
import LoginWidget.Model exposing (LoginStatus(..), Model)
import Message exposing (Msg(..))
import Views.LoadingSpinner as LoadingSpinner


view : Model -> Html Msg
view model =
    div [ id "login" ]
        (case model.status of
            NotLoggedIn ->
                [ p [] [ text "Access Seriatim using your preferred social media account:" ]
                , a
                    [ onClick <| LoginMessage (GetLoginURL Twitter)
                    , id "loginTwitter"
                    , class "login"
                    ]
                    [ text "Login via Twitter" ]
                , a
                    [ onClick <| LoginMessage (GetLoginURL Google)
                    , id "loginGoogle"
                    , class "login"
                    ]
                    [ text "Login via Google" ]
                , a
                    [ onClick <| LoginMessage (GetLoginURL Facebook)
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
                    , span
                        [ onClick <| LoginMessage Logout
                        , id "logoutLink"
                        ]
                        [ text "log out" ]
                    , text "."
                    ]
                ]

            _ ->
                [ LoadingSpinner.view ]
        )
