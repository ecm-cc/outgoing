const express = require('express');
const sendInvoices = require('../modules/sendInvoices');
const { getLocalConfig } = require('../global.config');

module.exports = () => {
    const router = express.Router();

    router.post('/', async (req, res) => {
        console.log(`TenantId:${req.tenantId}`);
        console.log(`SystemBaseUri:${req.systemBaseUri}`);
        const postData = req.body;
        const invoices = JSON.parse(postData.invoices);
        const config = getLocalConfig(req.tenantId);
        await sendInvoices(invoices, req.headers.cookie, config);
        res.send(200);
    });
    return router;
};
