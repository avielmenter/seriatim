module Settings.Update exposing (update)

import Settings.Model exposing (..)
import Settings.Message exposing (..)
import Message exposing (..)
import LoginWidget.Model exposing (LoginStatus(..))
import Navigation exposing (newUrl)
import Http
import Settings.HttpRequests exposing (renameUserRequest)


update : Settings.Message.Msg -> Model -> ( Model, Cmd Message.Msg )
update msg model =
    case msg of
        LoadUser status ->
            case status of
                LoggedInAs u ->
                    ( { model
                        | displayName =
                            case model.displayName of
                                Saving _ _ ->
                                    Saved u.display_name

                                _ ->
                                    Set u.display_name
                      }
                    , Cmd.none
                    )

                _ ->
                    ( { model | displayName = Unset }, Cmd.none )

        ToggleSettings ->
            let
                newHash =
                    if model.visible then
                        "#"
                    else
                        "#settings"

                updatedDisplayName =
                    case model.displayName of
                        Saved a ->
                            if model.visible then
                                Set a
                            else
                                model.displayName

                        _ ->
                            model.displayName
            in
                ( { model | visible = not model.visible, displayName = updatedDisplayName }, newUrl newHash )

        EditName s ->
            let
                origValue =
                    Maybe.withDefault "" (getOriginalValue model.displayName)

                updatedDisplayName =
                    if origValue == s then
                        Set s
                    else
                        Editing s origValue
            in
                ( { model | displayName = updatedDisplayName }, Cmd.none )

        SaveName ->
            case model.displayName of
                Editing curr orig ->
                    ( { model | displayName = Saving curr orig }
                    , Http.send (\r -> UpdateUser r) (renameUserRequest model.config.seriatim_server_url curr)
                    )

                _ ->
                    ( model, Cmd.none )

        RejectName ->
            let
                resetName =
                    case (getOriginalValue model.displayName) of
                        Just orig ->
                            Set orig

                        Nothing ->
                            Unset
            in
                ( { model | displayName = resetName }, Cmd.none )
