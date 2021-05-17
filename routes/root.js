const express = require('express');

module.exports = (basePath) => {
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
            default() {
                res.status(406).send('Not Acceptable');
            },
        });
    });
    return router;
};
