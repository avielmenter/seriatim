import * as React from 'react';
import * as ReactDOM from 'react-dom';

import App from './components/app';

import './styles/main.sass';
import './styles/documentList.sass';
import './styles/spinner.css'
import './styles/savingSpinner.css'
import './styles/settings.sass'
import './styles/login.sass'

ReactDOM.render(<App />, document.getElementById('app'));