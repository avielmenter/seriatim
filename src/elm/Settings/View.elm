module Settings.View exposing (view)

import Data.Login exposing (LoginMethod(..))
import Html exposing (Html, text)
import Html.Attributes exposing (class, id, maxlength, type_, value)
import Html.Events exposing (onClick, onInput)
import LoginWidget.Model exposing (LoginStatus(..))
import LoginWidget.View
import Message exposing (Msg(..))
import Settings.Message exposing (Msg(..))
import Settings.Model exposing (Model, Setting(..), getSettingValue)
import Settings.Views.ErrorMessage as ErrorMessage
import Settings.Views.LoginMethod as LoginMethod
import Settings.Views.SettingIcons as SettingIcons
import Util exposing (isNothing, isSomething)


view : Model -> Html Message.Msg
view model =
    Html.div
        [ class <|
            "heightTransition flexibleContentWidth settings"
                ++ (if model.visible then
                        "Visible"

                    else
                        "Invisible"
                   )
        , id "settings"
        ]
        ((case model.error of
            Just msg ->
                [ ErrorMessage.view msg ]

            Nothing ->
                []
         )
            ++ (case model.currentUser of
                    LoggedInAs u ->
                        [ Html.div [ id "userSettings" ] <|
                            [ Html.span
                                [ id "logoutLink"
                                , onClick (SettingsMessage Logout)
                                ]
                                [ text "Log Out" ]
                            , Html.h4 [] [ text "Display Name" ]
                            , SettingIcons.view { onConfirm = SettingsMessage SaveName, onReject = SettingsMessage RejectName, setting = model.displayName }
                            , Html.input
                                [ type_ "input"
                                , id "displayNameSetting"
                                , value <| getSettingValue model.displayName u.display_name
                                , onInput (\s -> SettingsMessage <| Settings.Message.EditName s)
                                , maxlength 32
                                ]
                                []
                            , Html.span [ class "headerCaption" ] [ text " (This name may be visible to others) " ]
                            , Html.div [ id "loginMethodsOnAccount" ]
                                (Html.h4 [] [ text "Ways to Log In to Your Account" ]
                                    :: (if isSomething u.twitter_screen_name then
                                            [ LoginMethod.view { loginMethod = Twitter, onAccount = ( True, model.hasTwitterLogin ), config = model.config } ]

                                        else
                                            []
                                       )
                                    ++ (if isSomething u.google_id then
                                            [ LoginMethod.view { loginMethod = Google, onAccount = ( True, model.hasGoogleLogin ), config = model.config } ]

                                        else
                                            []
                                       )
                                    ++ (if isSomething u.facebook_id then
                                            [ LoginMethod.view { loginMethod = Facebook, onAccount = ( True, model.hasFacebookLogin ), config = model.config } ]

                                        else
                                            []
                                       )
                                )
                            , if isNothing u.twitter_screen_name || isNothing u.google_id || isNothing u.facebook_id then
                                Html.div [ id "loginMethodsNotOnAccount" ]
                                    (Html.h4 [] [ text "Other Ways to Log In" ]
                                        :: (if isNothing u.twitter_screen_name then
                                                [ LoginMethod.view { loginMethod = Twitter, onAccount = ( False, model.hasTwitterLogin ), config = model.config } ]

                                            else
                                                []
                                           )
                                        ++ (if isNothing u.google_id then
                                                [ LoginMethod.view { loginMethod = Google, onAccount = ( False, model.hasGoogleLogin ), config = model.config } ]

                                            else
                                                []
                                           )
                                        ++ (if isNothing u.facebook_id then
                                                [ LoginMethod.view { loginMethod = Facebook, onAccount = ( False, model.hasFacebookLogin ), config = model.config } ]

                                            else
                                                []
                                           )
                                    )

                              else
                                Html.div [] []
                            ]
                        ]

                    _ ->
                        [ Html.div [ id "login" ] [ LoginWidget.View.view { status = model.currentUser, flags = model.config } ] ]
               )
        )
