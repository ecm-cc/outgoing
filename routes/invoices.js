const express = require('express');
const sendInvoices = require('../modules/sendInvoices');
// const { getLocalConfig } = require('../global.config');

module.exports = () => {
    const router = express.Router();

    router.post('/', async (req, res) => {
        console.log(`TenantId:${req.tenantId}`);
        console.log(`SystemBaseUri:${req.systemBaseUri}`);
        const postData = req.body;
        const invoices = JSON.parse(postData.invoices);
        await sendInvoices(invoices, req.headers.cookie);
        // const config = getLocalConfig(req.tenantId);
        res.send({ failed: ['D100961628'], succeded: ['D100813953', 'D100834431'] });
    });
    return router;
};
