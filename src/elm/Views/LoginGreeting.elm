module Views.LoginGreeting exposing (view)

import Html exposing (Html, text)
import Html.Attributes exposing (id)
import Html.Events exposing (onClick)
import LoginWidget.Model exposing (LoginStatus(..))
import Message exposing (Msg(..))
import Model exposing (Model)
import Settings.Message exposing (Msg(..))
import Views.LoadingSpinner as LoadingSpinner
import Views.MaterialIcon as MaterialIcon


view : Model -> Html Message.Msg
view model =
    Html.h4 [ onClick (Message.SettingsMessage Settings.Message.ToggleSettings) ] <|
        case model.settings.currentUser of
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
                    [ MaterialIcon.view "settings" ]
                , text <| "Hello, " ++ u.display_name
                ]

            LoginWidget.Model.Loading ->
                [ Html.div [ id "headerLogin" ] [ LoadingSpinner.view ] ]

            NotLoggedIn ->
                [ Html.span [] [ text "Log In" ] ]
