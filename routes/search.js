const express = require('express');
const getSearchURL = require('../modules/getSearchURL');
const { getLocalConfig } = require('../global.config');

module.exports = () => {
    const router = express.Router();
    router.get('/', async (req, res) => {
        const config = getLocalConfig(req.tenantId);
        const searchURL = await getSearchURL(config);
        res.send({ searchURL });
    });
    return router;
};
