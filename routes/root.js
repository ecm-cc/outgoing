const express = require('express');

module.exports = (basePath, assetBasePath) => {
    const router = express.Router();

    router.get('/', (req, res) => {
        console.log(`TenantId:${req.tenantId}`);
        console.log(`SystemBaseUri:${req.systemBaseUri}`);
        res.format({
            'application/hal+json': () => {
                res.send({
                    _links: {
                        featuresdescription: {
                            href: `${basePath}/features`,
                        },
                    },
                });
            },
            'text/html': () => {
                res.render('root', {
                    title: 'Testseite',
                    stylesheet: `${assetBasePath}/global.css`,
                    script: `${assetBasePath}/root.js`,
                    body: '/../views/root.hbs',
                });
            },
            default() {
                res.status(406).send('Not Acceptable');
            },
        });
    });
    return router;
};
