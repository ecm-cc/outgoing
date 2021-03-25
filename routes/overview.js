const express = require('express');
const { getLocalConfig } = require('../global.config');
const getSearchURL = require('../modules/getSearchURL');

module.exports = (assetBasePath) => {
    const router = express.Router();

    router.get('/', async (req, res) => {
        console.log(`TenantId:${req.tenantId}`);
        console.log(`SystemBaseUri:${req.systemBaseUri}`);
        const config = getLocalConfig(req.tenantId);
        const metaData = await getMetaData(config, assetBasePath);
        res.format({
            'text/html': () => {
                res.render('overview', {
                    title: 'Order to Cash Services',
                    stylesheet: `${assetBasePath}/global.css`,
                    script: `${assetBasePath}/overview.js`,
                    body: '/../views/overview.hbs',
                    metaData: JSON.stringify(metaData),
                });
            },
            default() {
                res.status(406).send('Not Acceptable');
            },
        });
    });
    return router;
};

async function getMetaData(config, assetBasePath) {
    const searchURL = await getSearchURL(config);
    return {
        config,
        searchURL,
        assetBasePath,
    };
}
