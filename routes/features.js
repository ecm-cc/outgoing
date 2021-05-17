const express = require('express');

module.exports = (basePath, assetBasePath) => {
    const router = express.Router();

    router.get('/', async (req, res) => {
        console.log(`TenantId:${req.tenantId}`);
        console.log(`SystemBaseUri:${req.systemBaseUri}`);
        res.format({
            'application/hal+json': () => {
                res.send({
                    features: [
                        {
                            url: `${basePath}/overview`,
                            title: 'O2CS',
                            subtitle: 'Rechnungen versenden',
                            iconURI: `${assetBasePath}/icon.svg`,
                            summary: 'Versenden von Rechnungen an Crossinx.',
                            description: 'Sie sehen Rechnungen ein und wählen die aus, die an Crossinx versendet werden.',
                            color: '#733651',
                        },
                    ],
                });
            },
            default() {
                res.status(406).send('Not Acceptable');
            },
        });
    });
    return router;
};
