import axios from 'axios';

const getConfig = async (url) => {
  let config;
  switch(url) {
    case 'able-group-dev.d-velop.cloud': config = {
        host: 'https://able-group-dev.d-velop.cloud',
        repositoryID: '1a2cde3f-2913-3dc2-4a2e-e623459ac23a',
        invoiceCategory: 'AKUNR',
        invoiceStatusPropertyID: '262'
      };
      break;
    case 'able-group-qas.d-velop.cloud': 
      config = {
        host: 'https://able-group-qas.d-velop.cloud',
        repositoryID: '64bdf712-b328-5f46-8fd0-b8e67aaf8bec',
        invoiceCategory: 'AKUNR',
        invoiceStatusPropertyID: '279'
      };
      break;
    case 'able-group-version.d-velop.cloud':
      config = {
        host: 'https://able-group-version.d-velop.cloud',
        repositoryID: '576583f0-8cd0-5796-bc94-e49426e7bbfb',
        invoiceCategory: 'AKUNR',
        invoiceStatusPropertyID: '280'
      };
      break;
    case 'able-group.d-velop.cloud':
      config = {
        host: 'https://able-group.d-velop.cloud',
        repositoryID: '1a2cde3f-2913-3dc2-4a2e-e623459ac23a',
        invoiceCategory: 'AKUNR',
        invoiceStatusPropertyID: '262'
      };
      break;
    }
  config.searchURL = await getSearchURL();
  return config;
};

async function getSearchURL() {
  const response = await axios.get('/able-outgoing/search');
  return response.data.searchURL;
}

export { getConfig };
