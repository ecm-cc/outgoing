const propertyMapping = require('@ablegroup/propertymapping');

module.exports = async (config) => {
    propertyMapping.initDatabase();
    const searchHost = `${config.host}/dms/r/${config.repositoryID}/sr/?objectdefinitionids`;
    const invoiceCategory = await getInvoiceCategory(config);
    const sorting = 'propertysort=property_last_modified_date';
    const searchProperties = await getSearchProperties(config);
    const searchURL = `${searchHost}=${invoiceCategory}&${searchProperties}&${sorting}`;
    return searchURL;
};

async function getInvoiceCategory(config) {
    const category = await propertyMapping.getCategory(config.stage, null, null, 'Kunden - Rechnungsakte');
    return `["${category.categoryKey}"]`;
}

async function getSearchProperties(config) {
    const processingState = await propertyMapping.getProperty(config.stage, null, 'Verarbeitungsstatus');
    const processingStateFilter = `"${processingState.propertyKey}":["Offen", "Fehler", "Versandbereit"]`;
    const internalReceipt = await propertyMapping.getProperty(config.stage, null, 'Interner Beleg');
    const internalReceiptFilter = `"${internalReceipt.propertyKey}":[""]`;
    const kuSoFa = await propertyMapping.getProperty(config.stage, null, 'KuSoFa');
    const kuSoFaFilter = `"${kuSoFa.propertyKey}":[""]`;
    const gsProcess = await propertyMapping.getProperty(config.stage, null, 'GS-Verfahren');
    const gsProcessFilter = `"${gsProcess.propertyKey}":[""]`;
    return `properties={${processingStateFilter},${internalReceiptFilter},${kuSoFaFilter},${gsProcessFilter}}`;
}
