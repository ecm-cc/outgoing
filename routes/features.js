const express = require('express');
const checkGroup = require('@ablegroup/checkgroup');
const { getLocalConfig } = require('../global.config');

module.exports = (basePath, assetBasePath) => {
    const router = express.Router();

    router.get('/', async (req, res) => {
        console.log(`TenantId:${req.tenantId}`);
        console.log(`SystemBaseUri:${req.systemBaseUri}`);
        const config = getLocalConfig(req.tenantId);
        const features = await getFeatures(req, basePath, assetBasePath, config);
        res.format({
            'application/hal+json': () => {
                res.send({
                    features,
                });
            },
            default() {
                res.status(406).send('Not Acceptable');
            },
        });
    });
    return router;
};

async function getFeatures(req, basePath, assetBasePath, config) {
    const isInO2CSGroup = await checkGroup(req, config.groupO2CS);
    if (isInO2CSGroup) {
        return [
            {
                url: `${basePath}/overview`,
                title: 'O2CS',
                subtitle: 'Rechnungen versenden',
                iconURI: `${assetBasePath}/icon.svg`,
                summary: 'Versenden von Rechnungen an Crossinx.',
                description: 'Sie sehen Rechnungen ein und wählen die aus, die an Crossinx versendet werden.',
                color: '#733651',
            },
        ];
    }
    const isInAdminGroup = await checkGroup(req, config.groupAdmin);
    if (isInAdminGroup) {
        return [
            {
                url: `${basePath}/overview`,
                title: 'O2CS',
                subtitle: 'Rechnungen versenden',
                iconURI: `${assetBasePath}/icon.svg`,
                summary: 'Versenden von Rechnungen an Crossinx.',
                description: 'Sie sehen Rechnungen ein und wählen die aus, die an Crossinx versendet werden.',
                color: '#733651',
            },
        ];
    }
    return [
    ];
}
