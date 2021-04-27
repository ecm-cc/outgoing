import axios from 'axios';

const getConfig = async (url) => {
  let config;
  switch(url) {
    case 'able-group-dev.d-velop.cloud': config = {
        host: 'https://able-group-dev.d-velop.cloud',
        repositoryID: '1a2cde3f-2913-3dc2-4a2e-e623459ac23a',
      };
      break;
    case 'able-group-qas.d-velop.cloud': 
      config = {};
      break;
    case 'able-group-version.d-velop.cloud':
      config = {};
      break;
    case 'able-group.d-velop.cloud':
      config = {};
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
