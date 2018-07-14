import './styles/main.sass';
import './styles/spinner.css';

var Elm = require('./elm/LoginWidget/Main.elm');
var mountNode = document.getElementById('login');

var app = Elm.LoginWidget.Main.embed(mountNode, {
	seriatim_client_url: SERIATIM_CLIENT_URL,
	seriatim_server_url: SERIATIM_SERVER_URL
});

if (!SERIATIM_CLIENT_URL.includes("localhost")) {	// because we don't have https, hide the (nonfunctional) facebook login button in production
	let style = document.createElement("style") as HTMLStyleElement;
	style.appendChild(document.createTextNode(""));

	if (style.sheet)
		(style.sheet as CSSStyleSheet).insertRule("#loginFacebook { visibility: hidden }");

	document.head.appendChild(style);
}