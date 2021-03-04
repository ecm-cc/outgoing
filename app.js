const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs = require('express-handlebars');
const tenant = require('@ablegroup/tenant')(process.env.systemBaseUri, process.env.SIGNATURE_SECRET);
const requestId = require('@ablegroup/requestid');

const appName = 'able-outgoing';
const basePath = `/${appName}`;
const assetBasePath = process.env.ASSET_BASE_PATH || `/${appName}/assets`;

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: `${__dirname}/views/`,
    partialsDir: `${__dirname}/views/partials/`,
    helpers: {
        // helpers,
    },
}));
app.set('view engine', 'hbs');

app.use(tenant);
app.use(requestId);
logger.token('tenantId', (req) => req.tenantId);
logger.token('requestId', (req) => req.requestId);

const rootRouter = require('./routes/root')(assetBasePath);

// eslint-disable-next-line max-len
app.use(logger('[ctx@49610 rid=":requestId" tn=":tenantId"][http@49610 method=":method" url=":url" millis=":response-time" sbytes=":res[content-length]" status=":status"] '));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(assetBasePath, express.static(path.join(__dirname, 'web')));

app.use(`${basePath}/`, rootRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// error handler
app.use((err, req, res) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    console.error(err.message);

    // render the error page
    res.status(err.status || 500);
    res.render('error', {
        title: 'Fehler',
        stylesheet: `${assetBasePath}/global.css`,
        body: '/../views/error.hbs',
    });
});

module.exports = app;
