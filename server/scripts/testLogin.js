/**
 * Login endpoint'ini test eder
 */

require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3001';

async function testLogin() {
  try {
    const email = 'abiler@hotmail.com';
    const password = 'test123'; // Gerçek şifreyi bilmiyoruz, bu sadece test
    
    console.log(`🔍 Login testi: ${email}\n`);

    // BUSINESS rolü ile giriş denemesi
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
        role: 'BUSINESS'
      });

      console.log('❌ SORUN: Giriş başarılı oldu!');
      console.log('Response:', JSON.stringify(response.data, null, 2));
      console.log('\n⚠️  Bu işletme isActive: false olmasına rağmen giriş yapabildi!');
    } catch (error) {
      if (error.response) {
        console.log('✅ Beklenen: Giriş engellendi');
        console.log('Status:', error.response.status);
        console.log('Error:', error.response.data);
        
        if (error.response.status === 403) {
          console.log('\n✅ Login kontrolü çalışıyor - isActive kontrolü başarılı');
        } else {
          console.log('\n⚠️  Beklenmeyen hata kodu:', error.response.status);
        }
      } else {
        console.log('❌ Network hatası:', error.message);
      }
    }

    // Role olmadan giriş denemesi
    console.log('\n\n🔍 Role olmadan login testi:\n');
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      console.log('❌ SORUN: Role olmadan giriş başarılı oldu!');
      console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      if (error.response) {
        console.log('✅ Beklenen: Giriş engellendi');
        console.log('Status:', error.response.status);
        console.log('Error:', error.response.data);
      } else {
        console.log('❌ Network hatası:', error.message);
      }
    }

  } catch (error) {
    console.error('❌ Test hatası:', error.message);
  }
}

testLogin();

