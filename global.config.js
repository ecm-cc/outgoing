function getLocalConfig(tenant) {
    switch (tenant) {
    // DEV
    case '14q': return {
        stage: 'dev',
        host: 'https://able-group-dev.d-velop.cloud',
        repositoryID: '1a2cde3f-2913-3dc2-4a2e-e623459ac23a',
    };
    // QAS
    case '197': return {
    };
    // Version
    case '1ha': return {
    };
    // Default: PROD
    default: return {
    };
    }
}

module.exports = {
    getLocalConfig,
};
