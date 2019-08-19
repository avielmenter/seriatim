import * as React from 'react';

import ElmComponent from './elmComponent';

const ElmSrc = require('../elm/Main.elm').Elm;
const flags = {
	seriatim_client_url: SERIATIM_CLIENT_URL,
	seriatim_server_url: SERIATIM_SERVER_URL
};

type ComponentProps = {}

const DocumentList: React.SFC<ComponentProps> = (props) => (
	<ElmComponent src={ElmSrc.Main} flags={flags} />
);

export default DocumentList;