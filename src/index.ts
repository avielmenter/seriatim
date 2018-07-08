import './styles.sass';

var Elm = require('./elm/LoginWidget/Main.elm');
var mountNode = document.getElementById('login');

var app = Elm.LoginWidget.Main.embed(mountNode, {
	seriatim_client_url: SERIATIM_CLIENT_URL,
	seriatim_server_url: SERIATIM_SERVER_URL
});