const express = require('express');
const path = require('path');

module.exports = () => {
    const router = express.Router();

    router.get('/', async (req, res) => {
        console.log(`TenantId:${req.tenantId}`);
        console.log(`SystemBaseUri:${req.systemBaseUri}`);
        res.format({
            'text/html': () => {
                res.sendFile(path.join(`${__dirname}`, '/../views/index.html'));
            },
            default() {
                res.status(406).send('Not Acceptable');
            },
        });
    });
    return router;
};
