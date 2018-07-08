module LoginWidget.Main exposing (..)

import Data.User exposing (User)
import Html exposing (..)
import Html.Attributes exposing (href, id, class)
import Http
import LoginWidget.HttpRequests exposing (getLoggedInUser)
import SeriatimHttp exposing (HttpResult, SeriatimResult)
import Util exposing (Flags)


main : Program Flags Model Msg
main =
    Html.programWithFlags
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


type ModelStatus
    = Loading
    | NotLoggedIn
    | LoggedInAs User


type alias Model =
    { status : ModelStatus
    , flags : Flags
    }


type Msg
    = Load (HttpResult User)


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Load (Ok (Ok u)) ->
            ( { model | status = LoggedInAs u }, Cmd.none )

        Load _ ->
            ( { model | status = NotLoggedIn }, Cmd.none )


view : Model -> Html Msg
view model =
    case model.status of
        NotLoggedIn ->
            div []
                [ p [] [ text "Access Seriatim using your preferred social media account:" ]
                , a
                    [ href <|
                        model.flags.seriatim_server_url
                            ++ "login/twitter?url="
                            ++ (Http.encodeUri <| model.flags.seriatim_client_url ++ "documents")
                    , id "loginTwitter"
                    , class "login"
                    ]
                    [ text "Login via Twitter" ]
                ]

        LoggedInAs u ->
            div []
                [ p [] [ text <| "Welcome, " ++ u.twitter_name ++ "!" ]
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
            div
                [ class "spinner"
                ]
                [ div [ class "bounce1" ] []
                , div [ class "bounce2" ] []
                , div [ class "bounce3" ] []
                ]


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none


init : Flags -> ( Model, Cmd Msg )
init flags =
    ( { status = Loading
      , flags = flags
      }
    , Http.send Load (getLoggedInUser flags.seriatim_server_url)
    )
