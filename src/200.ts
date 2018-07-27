import './styles/main.sass';
import './styles/documentList.sass';

var Elm = require('./elm/Main.elm');
var mountNode = document.getElementsByTagName('main')[0];

var app = Elm.Main.embed(mountNode, {
	seriatim_client_url: SERIATIM_CLIENT_URL,
	seriatim_server_url: SERIATIM_SERVER_URL
});