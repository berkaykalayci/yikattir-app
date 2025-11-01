// API Configuration
// Bu dosyayı kendi sunucu IP'nize göre güncelleyin

// Development için: Kendi bilgisayarınızın yerel IP adresini buraya yazın
// IP adresinizi öğrenmek için: macOS/Linux: ifconfig | grep "inet " | grep -v 127.0.0.1
// Windows: ipconfig | findstr IPv4

// Production için: Gerçek sunucu URL'nizi buraya yazın
// Fiziksel cihazdan test ediyorsanız: Kendi IP adresinizi buraya yazın
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.20:3001'  // Fiziksel cihaz için yerel IP
  : 'http://192.168.1.20:3001'; // Production için değiştirin

// Simülatör/Emülatör kullanıyorsanız:
// const API_BASE_URL = 'http://localhost:3001'; // iOS Simülatör
// const API_BASE_URL = 'http://10.0.2.2:3001'; // Android Emülatör

export default API_BASE_URL;

