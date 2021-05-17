const axios = require('axios');

module.exports = async (invoices, cookie, config) => {
    try {
        await axios({
            url: config.lightsailURL,
            method: 'post',
            auth: {
                username: config.lightsailUser,
                password: config.lightsailPass,
            },
            headers: {
                Cookie: cookie,
            },
            data: {
                invoices,
            },
        });
    } catch (err) {
        console.debug(err);
    }
};
