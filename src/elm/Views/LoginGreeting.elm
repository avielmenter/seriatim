module Views.LoginGreeting exposing (view)

import Html exposing (Html, text)
import Html.Attributes exposing (id)
import Html.Events exposing (onClick)
import LoginWidget.Model exposing (LoginStatus(..))
import Views.LoadingSpinner as LoadingSpinner
import Model exposing (..)
import Message exposing (..)
import Settings.Message exposing (..)


view : Model -> Html Message.Msg
view model =
    Html.h4 [ onClick (Message.SettingsMessage Settings.Message.ToggleSettings) ] <|
        case model.currentUser of
            LoggedInAs u ->
                [ Html.span
                    [ id <|
                        "userSettingsIcon"
                            ++ (if model.settings.visible then
                                    "Active"
                                else
                                    ""
                               )
                    ]
                    [ text "⚙" ]
                , text <| "Hello, " ++ u.display_name
                ]

            LoginWidget.Model.Loading ->
                [ Html.div [ id "headerLogin" ] [ LoadingSpinner.view ] ]

            NotLoggedIn ->
                [ Html.span [] [ text "Log In" ] ]
