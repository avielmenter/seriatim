module Settings.Views.LoginMethod exposing (view)

import Html exposing (Html, text)
import Html.Attributes exposing (class, id, href)
import Html.Events exposing (onClick)
import Message exposing (Msg(..))
import Settings.Message exposing (Msg(..))
import Settings.Model exposing (..)
import LoginWidget.Model exposing (..)
import Settings.Views.SettingIcons as SettingIcons
import Util exposing (Flags)


type alias Model =
    { loginMethod : LoginMethod, onAccount : ( Bool, Setting Bool ), config : Flags }


view : Model -> Html Message.Msg
view model =
    Html.div
        [ class "loginMethod"
        ]
        ([ SettingIcons.view { onConfirm = None, onReject = None, setting = Tuple.second model.onAccount }
         , Html.span
            [ id <| "loginMethod_" ++ (getMethodString model.loginMethod), class "loginMethodName" ]
            [ text (getMethodViewName model.loginMethod) ]
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
                        [ Html.a
                            [ class "loginMethodLink"
                            , href <| (loginCallback model.config model.loginMethod) ++ "%23settings&merge=true"
                            ]
                            [ text "(add to account)" ]
                        ]
               )
        )
