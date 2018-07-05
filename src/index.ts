import './styles.sass';

let twitterLoginLink = document.getElementById('twitterLogin') as HTMLAnchorElement;
twitterLoginLink.href = SERIATIM_SERVER_URL + 'login/twitter?url=' + encodeURIComponent(SERIATIM_CLIENT_URL + 'documents');