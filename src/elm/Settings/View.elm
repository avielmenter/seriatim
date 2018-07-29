module Settings.View exposing (view)

import Html exposing (Html, text)
import Html.Attributes exposing (class, id, type_, value, maxlength)
import Html.Events exposing (onInput)
import Message exposing (..)
import Settings.Message exposing (Msg(..))
import Settings.Model exposing (..)
import Settings.Views.SettingIcons as SettingIcons


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
        [ Html.div [ id "userSettings" ] <|
            case model.displayName of
                Unset ->
                    [ Html.h4 [] [ text "You must be logged in to configure your settings." ] ]

                _ ->
                    [ SettingIcons.view { onConfirm = SettingsMessage SaveName, onReject = SettingsMessage RejectName, setting = model.displayName }
                    , Html.label [] [ text "Display Name: " ]
                    , Html.input
                        [ type_ "input"
                        , id "displayNameSetting"
                        , value <| Maybe.withDefault "" (getSettingValue model.displayName)
                        , onInput (\s -> SettingsMessage <| Settings.Message.EditName s)
                        , maxlength 32
                        ]
                        []
                    , Html.span [ class "headerCaption" ] [ text " (This name may be visible to others) " ]
                    ]
        ]
