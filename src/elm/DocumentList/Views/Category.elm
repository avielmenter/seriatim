module DocumentList.Views.Category exposing (view)

import Html exposing (Html, text)
import Html.Attributes exposing (class, type_, checked, id, for)
import Html.Events exposing (onClick)
import Message exposing (Msg(..))
import DocumentList.Message exposing (Msg(..))
import Data.Document exposing (DocumentID(..))
import Data.Category exposing (Category)
import Views.MaterialIcon as MaterialIcon


type alias Model =
    { document_id : DocumentID
    , category : Category
    }


view : Model -> Html Message.Msg
view model =
    Html.li [ class "categorySetting" ]
        [ Html.span
            [ class "removeCategory"
            , onClick (DocumentListMessage <| RemoveCategory model.document_id model.category.category_name)
            ]
            [ MaterialIcon.view "clear"
            ]
        , Html.span [ class "categorySettingName" ] [ text model.category.category_name ]
        ]
