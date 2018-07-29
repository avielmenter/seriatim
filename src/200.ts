import './styles/main.sass';
import './styles/documentList.sass';
import './styles/spinner.css'
import './styles/savingSpinner.css'
import './styles/settings.sass'

var Elm = require('./elm/Main.elm');
var mountNode = document.getElementById('app');

var app = Elm.Main.embed(mountNode, {
	seriatim_client_url: SERIATIM_CLIENT_URL,
	seriatim_server_url: SERIATIM_SERVER_URL
});