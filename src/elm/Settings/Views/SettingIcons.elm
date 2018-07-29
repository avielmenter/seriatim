module Settings.Views.SettingIcons exposing (..)

import Html exposing (Html, text)
import Html.Attributes exposing (class)
import Html.Events exposing (onClick)
import Message exposing (Msg)
import Settings.Model exposing (..)
import Views.SavingSpinner as SavingSpinner


type alias Model a =
    { onConfirm : Msg, onReject : Msg, setting : Setting a }


view : Model a -> Html Msg
view model =
    Html.div [ class "settingIcons" ]
        (case model.setting of
            Set _ ->
                []

            Editing _ _ ->
                [ Html.span [ class "settingConfirm", onClick model.onConfirm ] [ text "✔" ]
                , Html.span [ class "settingReject", onClick model.onReject ] [ text "✘" ]
                ]

            Saving _ _ ->
                [ SavingSpinner.view ]

            Saved _ ->
                [ Html.span [ class "settingSaved" ] [ text "saved" ] ]

            Unset ->
                []
        )
