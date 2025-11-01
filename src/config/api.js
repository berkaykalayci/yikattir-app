// API Configuration
// Bu dosyayı kendi sunucu IP'nize göre güncelleyin

// Development için: Kendi bilgisayarınızın yerel IP adresini buraya yazın
// IP adresinizi öğrenmek için: macOS/Linux: ifconfig | grep "inet " | grep -v 127.0.0.1
// Windows: ipconfig | findstr IPv4

// Production için: Gerçek sunucu URL'nizi buraya yazın
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3001'  // Simülatör/Emülatör için
  : 'http://localhost:3001'; // Production için değiştirin

// Eğer fiziksel cihazdan test ediyorsanız, aşağıdaki gibi kendi IP'nizi kullanın:
// const API_BASE_URL = 'http://YOUR_LOCAL_IP:3001';

export default API_BASE_URL;

