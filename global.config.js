require('dotenv').config();

function getLocalConfig(tenant) {
    switch (tenant) {
    // DEV
    case '14q': return {
        stage: 'dev',
        host: 'https://able-group-dev.d-velop.cloud',
        repositoryID: '1a2cde3f-2913-3dc2-4a2e-e623459ac23a',
        pageSize: 100,
        lightsailURL: 'https://ecm-inbound.able-group.de/invoice?stage=dev',
        lightsailUser: process.env.LIGHTSAIL_USER,
        lightsailPass: process.env.LIGHTSAIL_PASS,
    };
    // QAS
    case '197': return {
        stage: 'qas',
        host: 'https://able-group-qas.d-velop.cloud',
        repositoryID: '64bdf712-b328-5f46-8fd0-b8e67aaf8bec',
        pageSize: 100,
        lightsailURL: 'https://ecm-inbound.able-group.de/invoice?stage=qas',
        lightsailUser: process.env.LIGHTSAIL_USER,
        lightsailPass: process.env.LIGHTSAIL_PASS,
    };
    // Version
    case '1ha': return {
        stage: 'version',
        host: 'https://able-group-version.d-velop.cloud',
        repositoryID: '576583f0-8cd0-5796-bc94-e49426e7bbfb',
        pageSize: 100,
        lightsailURL: 'https://ecm-inbound.able-group.de/invoice?stage=version',
        lightsailUser: process.env.LIGHTSAIL_USER,
        lightsailPass: process.env.LIGHTSAIL_PASS,
    };
    // Default: PROD
    default: return {
        stage: 'prod',
        host: 'https://able-group.d-velop.cloud',
        repositoryID: '1a2cde3f-2913-3dc2-4a2e-e623459ac23a',
        pageSize: 100,
        lightsailURL: 'https://ecm-inbound.able-group.de/invoice?stage=prod',
        lightsailUser: process.env.LIGHTSAIL_USER,
        lightsailPass: process.env.LIGHTSAIL_PASS,
    };
    }
}

module.exports = {
    getLocalConfig,
};
