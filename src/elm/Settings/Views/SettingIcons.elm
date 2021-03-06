module Settings.Views.SettingIcons exposing (Model, view)

import Html exposing (Html)
import Html.Attributes exposing (class)
import Html.Events exposing (onClick)
import Message exposing (Msg)
import Settings.Model exposing (Model, Setting(..))
import Views.MaterialIcon as MaterialIcon
import Views.SavingSpinner as SavingSpinner


type alias Model a =
    { onConfirm : Msg
    , onReject : Msg
    , setting : Setting a
    }


view : Model a -> Html Msg
view model =
    Html.div [ class "settingIcons" ]
        (case model.setting of
            Set ->
                []

            Editing _ ->
                [ Html.span [ class "settingConfirm", onClick model.onConfirm ] [ MaterialIcon.view "done" ]
                , Html.span [ class "settingReject", onClick model.onReject ] [ MaterialIcon.view "clear" ]
                ]

            Saving _ ->
                [ SavingSpinner.view ]

            Saved ->
                [ Html.span [ class "settingSaved" ] [ MaterialIcon.view "check_circle" ] ]
        )
