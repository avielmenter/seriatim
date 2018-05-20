import * as express from 'express';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import * as methodOverride from 'method-override';
import * as dotenv from 'dotenv';
import * as logger from 'morgan';
import * as favicon from 'serve-favicon';

dotenv.config();
const app = express();

app.use(favicon(path.join(__dirname, '../dist', 'favicon.ico')));	
app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req : express.Request, res : express.Response) => {
	res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride());

app.use((req, res, next) => {
	let err = new Error('Not Found');
	next(err);
});

app.use((err : Error, req : express.Request, res : express.Response, next : express.NextFunction) => {
	let status = err.message == 'Not Found' ? 404 : 500;
	
	res.locals.error = req.app.get('env') === 'development' ? err : {};
	res.status(status)

	console.error(err);

	if (status == 404)
		res.send('HTTP 404 -- File Not Found');
	else
		res.send('HTTP 500 -- The Server Could Not Complete Your Request');
});

app.listen(process.env.PORT || 3000, () => console.log('Seriatim listening on port ' + (process.env.PORT || 3000) + '.'));

export default app;