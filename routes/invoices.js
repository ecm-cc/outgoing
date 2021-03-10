const express = require('express');
// const { getLocalConfig } = require('../global.config');

module.exports = () => {
    const router = express.Router();

    router.post('/', async (req, res) => {
        console.log(`TenantId:${req.tenantId}`);
        console.log(`SystemBaseUri:${req.systemBaseUri}`);
        // const config = getLocalConfig(req.tenantId);
        res.send({ failed: ['D100961628'], succeded: ['D100813953', 'D100834431'] });
    });
    return router;
};
