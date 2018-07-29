module LoginWidget.View exposing (view)

import Http
import Html exposing (..)
import Html.Attributes exposing (href, id, class)
import Message exposing (Msg(..))
import LoginWidget.Model exposing (Model, LoginStatus(..))
import Views.LoadingSpinner as LoadingSpinner
import Util exposing (Flags)


loginCallback : Flags -> String -> String
loginCallback flags method =
    flags.seriatim_server_url
        ++ "login/"
        ++ method
        ++ "?url="
        ++ (Http.encodeUri <| flags.seriatim_client_url ++ "documents")


view : Model -> Html Msg
view model =
    case model.status of
        NotLoggedIn ->
            div []
                [ p [] [ text "Access Seriatim using your preferred social media account:" ]
                , a
                    [ href <| loginCallback model.flags "twitter"
                    , id "loginTwitter"
                    , class "login"
                    ]
                    [ text "Login via Twitter" ]
                , a
                    [ href <| loginCallback model.flags "google"
                    , id "loginGoogle"
                    , class "login"
                    ]
                    [ text "Login via Google" ]
                , a
                    [ href <| loginCallback model.flags "facebook"
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
                        [ href <|
                            model.flags.seriatim_server_url
                                ++ "login/logout?url="
                                ++ (Http.encodeUri model.flags.seriatim_client_url)
                        , id "logout"
                        ]
                        [ text "log out" ]
                    , text "."
                    ]
                ]

        _ ->
            LoadingSpinner.view
