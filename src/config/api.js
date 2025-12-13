
const API_BASE_URL = __DEV__ 
  ? 'https://api.yikattir.com'  // Development - Local IP
  : 'https://api.yikattir.com'; // Production - Domain (HTTPS)

export default API_BASE_URL;

