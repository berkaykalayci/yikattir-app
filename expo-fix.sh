#!/bin/bash

echo "🔍 Expo Bağlantı Kontrolü ve Düzeltme"
echo "======================================"

# 1. IP kontrolü
echo ""
echo "📱 Mac IP Adresi:"
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print "   " $2}'

# 2. Port kontrolü
echo ""
echo "🔌 Port 8082 Durumu:"
if lsof -i :8082 | grep -q LISTEN; then
    echo "   ✅ Port 8082 açık ve dinliyor"
    lsof -i :8082 | grep LISTEN
else
    echo "   ❌ Port 8082 kapalı"
fi

# 3. Test isteği
echo ""
echo "🌐 Test İsteği:"
if curl -s -o /dev/null -w "   HTTP Status: %{http_code}\n" http://192.168.1.53:8082 > /dev/null 2>&1; then
    echo "   ✅ 192.168.1.53:8082 erişilebilir"
else
    echo "   ❌ 192.168.1.53:8082 erişilemiyor"
fi

echo ""
echo "📝 ÇÖZÜM ADIMLARI:"
echo "   1. iPhone'da Expo Go uygulamasını tamamen kapatın"
echo "   2. iPhone'u yeniden başlatın (opsiyonel ama önerilir)"
echo "   3. Mac'te firewall'u kontrol edin:"
echo "      System Settings > Network > Firewall"
echo "   4. Mac ve iPhone'un aynı WiFi ağında olduğundan emin olun"
echo "   5. iPhone'da Expo Go'yu açın ve QR kodu tekrar tarayın"
echo ""
echo "💡 Alternatif: Tunnel modu kullanın:"
echo "   npm run start:tunnel"

