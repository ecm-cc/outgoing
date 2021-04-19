const axios = require('axios');

module.exports = async (invoices, cookie) => {
    console.debug(`trying to send ${invoices.length} invoices`);
    try {
        await axios({
            url: 'https://ecm-inbound.able-group.de/invoice?stage=dev',
            method: 'post',
            auth: {
                username: 'sap_outgoing',
                password: 'Y|lnyVjKG*Cd~I3,',
            },
            headers: {
                Cookie: cookie,
            },
            data: {
                invoices,
            },
        });
        console.debug('Worked');
    } catch (err) {
        console.debug(err);
    }
};
