module Settings.Views.LoginMethod exposing (view)

import Data.Login exposing (LoginMethod, getLoginMethodString, getLoginMethodViewName)
import Html exposing (Html, text)
import Html.Attributes exposing (class, id)
import Html.Events exposing (onClick)
import LoginWidget.Model exposing (Model)
import Message exposing (Msg(..))
import Settings.Message exposing (Msg(..))
import Settings.Model exposing (Model, Setting)
import Settings.Views.SettingIcons as SettingIcons
import Util exposing (Flags)


type alias Model =
    { loginMethod : LoginMethod
    , onAccount : ( Bool, Setting Bool )
    , config : Flags
    }


view : Model -> Html Message.Msg
view model =
    Html.div
        [ class "loginMethod"
        ]
        ([ SettingIcons.view { onConfirm = None, onReject = None, setting = Tuple.second model.onAccount }
         , Html.span
            [ id <| "loginMethod_" ++ getLoginMethodString model.loginMethod, class "loginMethodName" ]
            [ text (getLoginMethodViewName model.loginMethod) ]
         ]
            ++ (case model.onAccount of
                    ( True, _ ) ->
                        [ Html.span
                            [ class "loginMethodLink"
                            , onClick (SettingsMessage <| RemoveLoginMethod model.loginMethod)
                            ]
                            [ text "(remove)" ]
                        ]

                    ( False, _ ) ->
                        [ Html.span
                            [ class "loginMethodLink"
                            , onClick (SettingsMessage <| AddLoginMethod model.loginMethod)
                            ]
                            [ text "(add to account)" ]
                        ]
               )
        )
