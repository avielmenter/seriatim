import './styles/main.sass';
import './styles/login.sass';
import './styles/spinner.css';

var Elm = require('./elm/LoginWidget/Main.elm').Elm;

var mountNode = document.getElementById('login');

var app = Elm.LoginWidget.Main.init({
	node: mountNode,
	flags: {
		seriatim_client_url: SERIATIM_CLIENT_URL,
		seriatim_server_url: SERIATIM_SERVER_URL
	}
});
