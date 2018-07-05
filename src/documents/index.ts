import '../styles.sass';

var Elm = require('../elm/DocumentList/Main.elm');
var mountNode = document.getElementsByTagName('main')[0];

var app = Elm.DocumentList.Main.embed(mountNode, {
	seriatim_client_url: SERIATIM_CLIENT_URL,
	seriatim_server_url: SERIATIM_SERVER_URL
});