
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.22:3001'  // Development - Local IP
  : 'https://api.yikattir.com'; // Production - Domain (HTTPS)

export default API_BASE_URL;

