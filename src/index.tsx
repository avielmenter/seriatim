import * as React from 'react';
import * as ReactDOM from 'react-dom';

import ElmComponent from './components/elmComponent';

import './styles/main.sass';
import './styles/login.sass';
import './styles/spinner.css';

const Elm = require('./elm/LoginWidget/Main.elm').Elm;
const flags = {
	seriatim_client_url: SERIATIM_CLIENT_URL,
	seriatim_server_url: SERIATIM_SERVER_URL
}

ReactDOM.render(<ElmComponent src={Elm.LoginWidget.Main} flags={flags} />, document.getElementById('login'));