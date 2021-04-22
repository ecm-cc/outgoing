const express = require('express');
const path = require('path');
const { getLocalConfig } = require('../global.config');
const getSearchURL = require('../modules/getSearchURL');

module.exports = (assetBasePath) => {
    const router = express.Router();

    router.get('/', async (req, res) => {
        console.log(`TenantId:${req.tenantId}`);
        console.log(`SystemBaseUri:${req.systemBaseUri}`);
        const config = getLocalConfig(req.tenantId);
        // eslint-disable-next-line no-unused-vars
        const metaData = await getMetaData(config, assetBasePath);
        res.format({
            'text/html': () => {
                res.sendFile(path.join(__dirname, '../vue/table/dist/index.html'));
                // res.render('overview', {
                //     title: 'Order to Cash Services',
                //     stylesheet: `${assetBasePath}/global.css`,
                //     script: `${assetBasePath}/overview.js`,
                //     body: '/../views/overview.hbs',
                //     metaData: JSON.stringify(metaData),
                // });
            },
            default() {
                res.status(406).send('Not Acceptable');
            },
        });
    });
    return router;
};

async function getMetaData(config, assetBasePath) {
    const search = await getSearchURL(config);
    const searchCount = await getSearchURL(config, 'sfc');
    return {
        config,
        urls: {
            search,
            searchCount,
        },
        assetBasePath,
    };
}
