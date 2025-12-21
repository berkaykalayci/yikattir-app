import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Text, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, Modal, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';

const TURKEY_CITIES = {
  'İstanbul': ['Adalar', 'Arnavutköy', 'Ataşehir', 'Avcılar', 'Bağcılar', 'Bahçelievler', 'Bakırköy', 'Başakşehir', 'Bayrampaşa', 'Beşiktaş', 'Beykoz', 'Beylikdüzü', 'Beyoğlu', 'Büyükçekmece', 'Çatalca', 'Çekmeköy', 'Esenler', 'Esenyurt', 'Eyüpsultan', 'Fatih', 'Gaziosmanpaşa', 'Güngören', 'Kadıköy', 'Kağıthane', 'Kartal', 'Küçükçekmece', 'Maltepe', 'Pendik', 'Sancaktepe', 'Sarıyer', 'Silivri', 'Sultanbeyli', 'Sultangazi', 'Şile', 'Şişli', 'Tuzla', 'Ümraniye', 'Üsküdar', 'Zeytinburnu'],
  'Ankara': ['Akyurt', 'Altındağ', 'Ayaş', 'Bala', 'Beypazarı', 'Çamlıdere', 'Çankaya', 'Çubuk', 'Elmadağ', 'Etimesgut', 'Evren', 'Gölbaşı', 'Güdül', 'Haymana', 'Kalecik', 'Kazan', 'Keçiören', 'Kızılcahamam', 'Mamak', 'Nallıhan', 'Polatlı', 'Pursaklar', 'Sincan', 'Şereflikoçhisar', 'Yenimahalle'],
  'İzmir': ['Aliağa', 'Balçova', 'Bayındır', 'Bayraklı', 'Bergama', 'Beydağ', 'Bornova', 'Buca', 'Çeşme', 'Çiğli', 'Dikili', 'Foça', 'Gaziemir', 'Güzelbahçe', 'Karabağlar', 'Karaburun', 'Karşıyaka', 'Kemalpaşa', 'Kınık', 'Kiraz', 'Konak', 'Menderes', 'Menemen', 'Narlıdere', 'Ödemiş', 'Seferihisar', 'Selçuk', 'Tire', 'Torbalı', 'Urla'],
  'Bursa': ['Büyükorhan', 'Gemlik', 'Gürsu', 'Harmancık', 'İnegöl', 'İznik', 'Karacabey', 'Keles', 'Kestel', 'Mudanya', 'Mustafakemalpaşa', 'Nilüfer', 'Orhaneli', 'Orhangazi', 'Osmangazi', 'Yenişehir', 'Yıldırım'],
  'Antalya': ['Akseki', 'Aksu', 'Alanya', 'Demre', 'Döşemealtı', 'Elmalı', 'Finike', 'Gazipaşa', 'Gündoğmuş', 'İbradı', 'Kaş', 'Kemer', 'Kepez', 'Konyaaltı', 'Korkuteli', 'Kumluca', 'Manavgat', 'Muratpaşa', 'Serik'],
  'Balıkesir': ['Altıeylül', 'Ayvalık', 'Balya', 'Bandırma', 'Bigadiç', 'Burhaniye', 'Dursunbey', 'Edremit', 'Erdek', 'Gömeç', 'Gönen', 'Havran', 'İvrindi', 'Karesi', 'Kepsut', 'Manyas', 'Marmara', 'Savaştepe', 'Sındırgı', 'Susurluk'],
  'Adana': ['Aladağ', 'Ceyhan', 'Çukurova', 'Feke', 'İmamoğlu', 'Karaisalı', 'Karataş', 'Kozan', 'Pozantı', 'Saimbeyli', 'Sarıçam', 'Seyhan', 'Tufanbeyli', 'Yumurtalık', 'Yüreğir'],
  'Adıyaman': ['Besni', 'Çelikhan', 'Gerger', 'Gölbaşı', 'Kahta', 'Merkez', 'Samsat', 'Sincik', 'Tut'],
  'Afyonkarahisar': ['Başmakçı', 'Bayat', 'Bolvadin', 'Çay', 'Çobanlar', 'Dazkırı', 'Dinar', 'Emirdağ', 'Evciler', 'Hocalar', 'İhsaniye', 'İscehisar', 'Kızılören', 'Merkez', 'Sandıklı', 'Sinanpaşa', 'Sultandağı', 'Şuhut'],
  'Ağrı': ['Diyadin', 'Doğubayazıt', 'Eleşkirt', 'Hamur', 'Merkez', 'Patnos', 'Taşlıçay', 'Tutak'],
  'Amasya': ['Göynücek', 'Gümüşhacıköy', 'Hamamözü', 'Merkez', 'Merzifon', 'Suluova', 'Taşova'],
  'Artvin': ['Ardanuç', 'Arhavi', 'Borçka', 'Hopa', 'Merkez', 'Murgul', 'Şavşat', 'Yusufeli'],
  'Aydın': ['Bozdoğan', 'Buharkent', 'Çine', 'Didim', 'Efeler', 'Germencik', 'İncirliova', 'Karacasu', 'Karpuzlu', 'Koçarlı', 'Köşk', 'Kuşadası', 'Kuyucak', 'Nazilli', 'Söke', 'Sultanhisar', 'Yenipazar'],
  'Bartın': ['Amasra', 'Kurucaşile', 'Merkez', 'Ulus'],
  'Batman': ['Beşiri', 'Gercüş', 'Hasankeyf', 'Kozluk', 'Merkez', 'Sason'],
  'Bayburt': ['Aydıntepe', 'Demirözü', 'Merkez'],
  'Bilecik': ['Bozüyük', 'Gölpazarı', 'İnhisar', 'Merkez', 'Osmaneli', 'Pazaryeri', 'Söğüt', 'Yenipazar'],
  'Bingöl': ['Adaklı', 'Genç', 'Karlıova', 'Kiğı', 'Merkez', 'Solhan', 'Yayladere', 'Yedisu'],
  'Bitlis': ['Adilcevaz', 'Ahlat', 'Güroymak', 'Hizan', 'Merkez', 'Mutki', 'Tatvan'],
  'Bolu': ['Dörtdivan', 'Gerede', 'Göynük', 'Kıbrıscık', 'Mengen', 'Merkez', 'Mudurnu', 'Seben', 'Yeniçağa'],
  'Burdur': ['Ağlasun', 'Altınyayla', 'Bucak', 'Çavdır', 'Çeltikçi', 'Gölhisar', 'Karamanlı', 'Kemer', 'Merkez', 'Tefenni', 'Yeşilova'],
  'Çanakkale': ['Ayvacık', 'Bayramiç', 'Biga', 'Bozcaada', 'Çan', 'Eceabat', 'Ezine', 'Gelibolu', 'Gökçeada', 'Lapseki', 'Merkez', 'Yenice'],
  'Çankırı': ['Atkaracalar', 'Bayramören', 'Çerkeş', 'Eldivan', 'Ilgaz', 'Kızılırmak', 'Korgun', 'Kurşunlu', 'Merkez', 'Orta', 'Şabanözü', 'Yapraklı'],
  'Çorum': ['Alaca', 'Bayat', 'Boğazkale', 'Dodurga', 'İskilip', 'Kargı', 'Laçin', 'Mecitözü', 'Merkez', 'Oğuzlar', 'Ortaköy', 'Osmancık', 'Sungurlu', 'Uğurludağ'],
  'Denizli': ['Acıpayam', 'Babadağ', 'Baklan', 'Bekilli', 'Beyağaç', 'Bozkurt', 'Buldan', 'Çal', 'Çameli', 'Çardak', 'Çivril', 'Güney', 'Honaz', 'Kale', 'Merkezefendi', 'Pamukkale', 'Sarayköy', 'Serinhisar', 'Tavas'],
  'Diyarbakır': ['Bağlar', 'Bismil', 'Çermik', 'Çınar', 'Çüngüş', 'Dicle', 'Eğil', 'Ergani', 'Hani', 'Hazro', 'Kayapınar', 'Kocaköy', 'Kulp', 'Lice', 'Silvan', 'Sur', 'Yenişehir'],
  'Düzce': ['Akçakoca', 'Cumayeri', 'Çilimli', 'Gölyaka', 'Gümüşova', 'Kaynaşlı', 'Merkez', 'Yığılca'],
  'Edirne': ['Enez', 'Havsa', 'İpsala', 'Keşan', 'Lalapaşa', 'Meriç', 'Merkez', 'Süloğlu', 'Uzunköprü'],
  'Elazığ': ['Ağın', 'Alacakaya', 'Arıcak', 'Baskil', 'Karakoçan', 'Keban', 'Kovancılar', 'Maden', 'Merkez', 'Palu', 'Sivrice'],
  'Erzincan': ['Çayırlı', 'İliç', 'Kemah', 'Kemaliye', 'Merkez', 'Otlukbeli', 'Refahiye', 'Tercan', 'Üzümlü'],
  'Erzurum': ['Aşkale', 'Aziziye', 'Çat', 'Hınıs', 'Horasan', 'İspir', 'Karaçoban', 'Karayazı', 'Köprüköy', 'Narman', 'Oltu', 'Olur', 'Palandöken', 'Pasinler', 'Pazaryolu', 'Şenkaya', 'Tekman', 'Tortum', 'Uzundere', 'Yakutiye'],
  'Eskişehir': ['Alpu', 'Beylikova', 'Çifteler', 'Günyüzü', 'Han', 'İnönü', 'Mahmudiye', 'Mihalgazi', 'Mihalıççık', 'Odunpazarı', 'Sarıcakaya', 'Seyitgazi', 'Sivrihisar', 'Tepebaşı'],
  'Gaziantep': ['Araban', 'İslahiye', 'Karkamış', 'Nizip', 'Nurdağı', 'Oğuzeli', 'Şahinbey', 'Şehitkamil', 'Yavuzeli'],
  'Giresun': ['Alucra', 'Bulancak', 'Çamoluk', 'Çanakçı', 'Dereli', 'Doğankent', 'Espiye', 'Eynesil', 'Görele', 'Keşap', 'Merkez', 'Piraziz', 'Şebinkarahisar', 'Tirebolu', 'Yağlıdere'],
  'Gümüşhane': ['Kelkit', 'Köse', 'Kürtün', 'Merkez', 'Şiran', 'Torul'],
  'Hakkari': ['Çukurca', 'Derecik', 'Merkez', 'Şemdinli', 'Yüksekova'],
  'Hatay': ['Altınözü', 'Antakya', 'Arsuz', 'Belen', 'Defne', 'Dörtyol', 'Erzin', 'Hassa', 'İskenderun', 'Kırıkhan', 'Kumlu', 'Payas', 'Reyhanlı', 'Samandağ', 'Yayladağı'],
  'Iğdır': ['Aralık', 'Karakoyunlu', 'Merkez', 'Tuzluca'],
  'Isparta': ['Aksu', 'Atabey', 'Eğirdir', 'Gelendost', 'Gönen', 'Keçiborlu', 'Merkez', 'Senirkent', 'Sütçüler', 'Şarkikaraağaç', 'Uluborlu', 'Yalvaç', 'Yenişarbademli'],
  'Konya': ['Ahırlı', 'Akören', 'Akşehir', 'Altınekin', 'Beyşehir', 'Bozkır', 'Cihanbeyli', 'Çeltik', 'Çumra', 'Derbent', 'Derebucak', 'Doğanhisar', 'Emirgazi', 'Ereğli', 'Güneysinir', 'Hadim', 'Halkapınar', 'Hüyük', 'Ilgın', 'Kadınhanı', 'Karapınar', 'Karatay', 'Kulu', 'Meram', 'Sarayönü', 'Selçuklu', 'Seydişehir', 'Taşkent', 'Tuzlukçu', 'Yalıhüyük', 'Yunak'],
  'Mersin': ['Akdeniz', 'Anamur', 'Aydıncık', 'Bozyazı', 'Çamlıyayla', 'Erdemli', 'Gülnar', 'Mezitli', 'Mut', 'Silifke', 'Tarsus', 'Toroslar', 'Yenişehir'],
  'Muğla': ['Bodrum', 'Dalaman', 'Datça', 'Fethiye', 'Kavaklıdere', 'Köyceğiz', 'Marmaris', 'Menteşe', 'Milas', 'Ortaca', 'Seydikemer', 'Ula', 'Yatağan'],
  'Muş': ['Bulanık', 'Hasköy', 'Korkut', 'Malazgirt', 'Merkez', 'Varto'],
  'Nevşehir': ['Acıgöl', 'Avanos', 'Derinkuyu', 'Gülşehir', 'Hacıbektaş', 'Kozaklı', 'Merkez', 'Ürgüp'],
  'Niğde': ['Altunhisar', 'Bor', 'Çamardı', 'Çiftlik', 'Merkez', 'Ulukışla'],
  'Ordu': ['Akkuş', 'Altınordu', 'Aybastı', 'Çamaş', 'Çatalpınar', 'Çaybaşı', 'Fatsa', 'Gölköy', 'Gülyalı', 'Gürgentepe', 'İkizce', 'Kabadüz', 'Kabataş', 'Korgan', 'Kumru', 'Mesudiye', 'Perşembe', 'Piraziz', 'Ulubey', 'Ünye'],
  'Rize': ['Ardeşen', 'Çamlıhemşin', 'Çayeli', 'Derepazarı', 'Fındıklı', 'Güneysu', 'Hemşin', 'İkizdere', 'İyidere', 'Kalkandere', 'Merkez', 'Pazar'],
  'Sakarya': ['Adapazarı', 'Akyazı', 'Arifiye', 'Erenler', 'Ferizli', 'Geyve', 'Hendek', 'Karapürçek', 'Karasu', 'Kaynarca', 'Kocaali', 'Pamukova', 'Sapanca', 'Serdivan', 'Söğütlü', 'Taraklı'],
  'Samsun': ['19 Mayıs', 'Alaçam', 'Asarcık', 'Atakum', 'Ayvacık', 'Bafra', 'Canik', 'Çarşamba', 'Havza', 'İlkadım', 'Kavak', 'Ladik', 'Ondokuzmayıs', 'Salıpazarı', 'Tekkeköy', 'Terme', 'Vezirköprü', 'Yakakent'],
  'Siirt': ['Baykan', 'Eruh', 'Kurtalan', 'Merkez', 'Pervari', 'Şirvan'],
  'Sinop': ['Ayancık', 'Boyabat', 'Dikmen', 'Durağan', 'Erfelek', 'Gerze', 'Merkez', 'Saraydüzü', 'Türkeli'],
  'Sivas': ['Akıncılar', 'Altınyayla', 'Divriği', 'Doğanşar', 'Gemerek', 'Gölova', 'Gürün', 'Hafik', 'İmranlı', 'Kangal', 'Koyulhisar', 'Merkez', 'Suşehri', 'Şarkışla', 'Ulaş', 'Yıldızeli', 'Zara'],
  'Şanlıurfa': ['Akçakale', 'Birecik', 'Bozova', 'Ceylanpınar', 'Eyyübiye', 'Halfeti', 'Haliliye', 'Harran', 'Hilvan', 'Karaköprü', 'Siverek', 'Suruç', 'Viranşehir'],
  'Şırnak': ['Beytüşşebap', 'Cizre', 'Güçlükonak', 'İdil', 'Merkez', 'Silopi', 'Uludere'],
  'Tekirdağ': ['Çerkezköy', 'Çorlu', 'Ergene', 'Hayrabolu', 'Kapaklı', 'Malkara', 'Marmaraereğlisi', 'Muratlı', 'Saray', 'Süleymanpaşa', 'Şarköy'],
  'Tokat': ['Almus', 'Artova', 'Başçiftlik', 'Erbaa', 'Merkez', 'Niksar', 'Pazar', 'Reşadiye', 'Sulusaray', 'Turhal', 'Yeşilyurt', 'Zile'],
  'Trabzon': ['Akçaabat', 'Araklı', 'Arsin', 'Beşikdüzü', 'Çarşıbaşı', 'Çaykara', 'Dernekpazarı', 'Düzköy', 'Hayrat', 'Köprübaşı', 'Maçka', 'Of', 'Ortahisar', 'Sürmene', 'Şalpazarı', 'Tonya', 'Vakfıkebir', 'Yomra'],
  'Tunceli': ['Çemişgezek', 'Hozat', 'Mazgirt', 'Merkez', 'Nazımiye', 'Ovacık', 'Pertek', 'Pülümür'],
  'Uşak': ['Banaz', 'Eşme', 'Karahallı', 'Merkez', 'Sivaslı', 'Ulubey'],
  'Van': ['Bahçesaray', 'Başkale', 'Çaldıran', 'Çatak', 'Edremit', 'Erciş', 'Gevaş', 'Gürpınar', 'İpekyolu', 'Muradiye', 'Özalp', 'Saray', 'Tuşba'],
  'Yalova': ['Altınova', 'Armutlu', 'Çınarcık', 'Çiftlikköy', 'Merkez', 'Termal'],
  'Yozgat': ['Akdağmadeni', 'Aydıncık', 'Boğazlıyan', 'Çandır', 'Çayıralan', 'Çekerek', 'Kadışehri', 'Merkez', 'Saraykent', 'Sarıkaya', 'Sorgun', 'Şefaatli', 'Yenifakılı', 'Yerköy'],
  'Zonguldak': ['Alaplı', 'Çaycuma', 'Devrek', 'Gökçebey', 'Kilimli', 'Kozlu', 'Merkez']
};

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirm: '', 
    phone: '',
    city: '',
    district: '',
    acceptedTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const insets = useSafeAreaInsets();
  const { register } = useAuth();

  const update = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleCitySelect = (city) => {
    setForm(prev => ({ ...prev, city, district: '' }));
    setShowCityDropdown(false);
    setShowDistrictDropdown(false);
  };

  const handleDistrictSelect = (district) => {
    setForm(prev => ({ ...prev, district }));
    setShowDistrictDropdown(false);
  };

  const getAvailableDistricts = () => {
    return TURKEY_CITIES[form.city] || [];
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const cleaned = phone.replace(/\s/g, '').replace(/[()-]/g, '');
    const turkishPhoneRegex = /^(0|90|\+90)?5[0-9]{9}$/;
    return turkishPhoneRegex.test(cleaned);
  };

  const handleRegister = async () => {
    if (!form.name.trim()) {
      Alert.alert('Hata', 'Ad alanı zorunludur.');
      return;
    }
    if (!form.email.trim()) {
      Alert.alert('Hata', 'E-posta alanı zorunludur.');
      return;
    }
    if (!validateEmail(form.email.trim())) {
      Alert.alert('Hata', 'Geçerli bir e-posta adresi giriniz.');
      return;
    }
    if (form.phone.trim() && !validatePhone(form.phone.trim())) {
      Alert.alert('Hata', 'Geçerli bir telefon numarası giriniz. (Örn: 05XX XXX XX XX)');
      return;
    }
    if (!form.password.trim()) {
      Alert.alert('Hata', 'Şifre alanı zorunludur.');
      return;
    }
    if (form.password !== form.confirm) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor.');
      return;
    }
    if (form.password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.');
      return;
    }
    if (!form.city.trim()) {
      Alert.alert('Hata', 'İl seçimi zorunludur.');
      return;
    }
    if (!form.district.trim()) {
      Alert.alert('Hata', 'İlçe seçimi zorunludur.');
      return;
    }
    if (!form.acceptedTerms) {
      Alert.alert('Hata', 'Kullanıcı sözleşmesini kabul etmelisiniz.');
      return;
    }

    setLoading(true);
    const result = await register(
      form.name.trim(),
      form.email.trim(),
      form.phone.trim() || null,
      form.password,
      form.city.trim(),
      form.district.trim()
    );
    setLoading(false);

    if (result.success) {
      Alert.alert('Başarılı', 'Kayıt işlemi tamamlandı!', [
        {
          text: 'Tamam',
          onPress: () => {
          }
        }
      ]);
    } else {
      Alert.alert('Kayıt Hatası', result.error);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{ flex: 1 }} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>KAYIT OL</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[
          styles.content, 
          { paddingTop: Math.max(insets.top, 16) + 60 + 16, paddingBottom: Math.max(insets.bottom, 24) + 24 }
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        scrollEnabled={true}
      >
        {[
          ['AD', 'name'],
          ['E-POSTA', 'email'],
          ['ŞİFRE', 'password', true],
          ['ŞİFRE ONAY', 'confirm', true],
          ['TELEFON', 'phone'],
        ].map(([label, key, secure]) => {
          let keyboardType = 'default';
          let placeholder = '';
          let onChangeHandler = (t) => update(key, t);
          
          if (key === 'email') {
            keyboardType = 'email-address';
          } else if (key === 'phone') {
            keyboardType = 'phone-pad';
            placeholder = '05XX XXX XX XX';
          }
          
          return (
            <View key={key} style={{ width: '100%' }}>
              <Text style={styles.label}>{label}</Text>
              <TextInput 
                style={styles.underline} 
                secureTextEntry={!!secure} 
                onChangeText={onChangeHandler}
                keyboardType={keyboardType}
                placeholder={placeholder}
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                returnKeyType={key === 'confirm' ? 'done' : 'next'}
                blurOnSubmit={key !== 'confirm'}
              />
            </View>
          );
        })}

        {/* İl Seçimi */}
        <View style={{ width: '100%' }}>
          <Text style={styles.label}>İL</Text>
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowCityDropdown(!showCityDropdown)}
          >
            <Text style={styles.dropdownText}>{form.city || 'İl Seçin'}</Text>
            <Ionicons name="chevron-down" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* İlçe Seçimi */}
        <View style={{ width: '100%' }}>
          <Text style={styles.label}>İLÇE</Text>
          <TouchableOpacity 
            style={[styles.dropdownButton, !form.city && styles.dropdownButtonDisabled]}
            onPress={() => form.city && setShowDistrictDropdown(!showDistrictDropdown)}
            disabled={!form.city}
          >
            <Text style={[styles.dropdownText, !form.city && styles.dropdownTextDisabled]}>
              {form.district || 'İlçe Seçin'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={form.city ? "#6b7280" : "#d1d5db"} />
          </TouchableOpacity>
        </View>

        {/* İl Dropdown */}
        {showCityDropdown && (
          <View style={styles.dropdownContainer}>
            <ScrollView style={styles.dropdownList} nestedScrollEnabled>
              {Object.keys(TURKEY_CITIES).map((city) => (
                <TouchableOpacity
                  key={city}
                  style={styles.dropdownItem}
                  onPress={() => handleCitySelect(city)}
                >
                  <Text style={styles.dropdownItemText}>{city}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* İlçe Dropdown */}
        {showDistrictDropdown && form.city && (
          <View style={styles.dropdownContainer}>
            <ScrollView style={styles.dropdownList} nestedScrollEnabled>
              {getAvailableDistricts().map((district) => (
                <TouchableOpacity
                  key={district}
                  style={styles.dropdownItem}
                  onPress={() => handleDistrictSelect(district)}
                >
                  <Text style={styles.dropdownItemText}>{district}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.termsContainer}>
          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => update('acceptedTerms', !form.acceptedTerms)}
          >
            <View style={[styles.checkbox, form.acceptedTerms && styles.checkboxChecked]}>
              {form.acceptedTerms && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <Text style={styles.termsText}>
              <Text style={styles.termsLink} onPress={() => setShowTermsModal(true)}>
                Kullanıcı Sözleşmesi
              </Text>
              {' '}ve{' '}
              <Text style={styles.termsLink} onPress={() => setShowTermsModal(true)}>
                Gizlilik Politikası
              </Text>
              'nı okudum ve kabul ediyorum.
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.btn, (loading || !form.acceptedTerms) && styles.btnDisabled]} 
          onPress={handleRegister}
          disabled={loading || !form.acceptedTerms}
        >
          <Text style={styles.btnText}>
            {loading ? 'Kayıt yapılıyor...' : 'KAYIT OL !'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate('BusinessRegister')}>
          <Text style={styles.linkBtnText}>İşletme olarak kayıt ol</Text>
        </TouchableOpacity>
        <View style={{ height: 24 }} />
      </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showTermsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Kullanıcı Sözleşmesi ve Gizlilik Politikası</Text>
              <TouchableOpacity onPress={() => setShowTermsModal(false)}>
                <Ionicons name="close" size={24} color="#0F4C4C" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalSectionTitle}>1. Kullanıcı Sözleşmesi</Text>
              <Text style={styles.modalText}>
                Bu sözleşme, YIKATTIR uygulamasını kullanarak hizmet almak isteyen kullanıcılar ile uygulama sahibi arasındaki hak ve yükümlülükleri düzenler.
              </Text>
              <Text style={styles.modalText}>
                • Uygulamayı kullanarak, bu sözleşmeyi kabul etmiş sayılırsınız.{'\n'}
                • Randevu bilgilerinizi doğru ve güncel tutmakla yükümlüsünüz.{'\n'}
                • İptal ve değişiklik politikalarına uymakla yükümlüsünüz.{'\n'}
                • Uygulamayı yasalara aykırı amaçlarla kullanamazsınız.
              </Text>

              <Text style={styles.modalSectionTitle}>2. Gizlilik Politikası</Text>
              <Text style={styles.modalText}>
                Kişisel verileriniz 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında işlenmektedir.
              </Text>
              <Text style={styles.modalText}>
                • Ad, e-posta, telefon gibi bilgileriniz randevu süreçlerinde kullanılır.{'\n'}
                • Konum bilgileriniz sadece yakındaki işletmeleri bulmak için kullanılır.{'\n'}
                • Verileriniz üçüncü taraflarla paylaşılmaz.{'\n'}
                • Verilerinize erişim, düzeltme ve silme haklarınız bulunmaktadır.
              </Text>
              <TouchableOpacity 
                style={styles.externalLink}
                onPress={() => Linking.openURL('https://yikattir.com/privacy')}
              >
                <Ionicons name="open-outline" size={18} color="#0F4C4C" />
                <Text style={styles.externalLinkText}>
                  Detaylı Gizlilik Politikası için tıklayın (yikattir.com/privacy)
                </Text>
              </TouchableOpacity>

              <Text style={styles.modalSectionTitle}>3. Sorumluluk</Text>
              <Text style={styles.modalText}>
                Uygulama, işletmeler ve hizmetler hakkında bilgi sağlar ancak hizmet kalitesinden sorumlu değildir. İşletmelerle olan anlaşmazlıklarınızı doğrudan işletme ile çözmeniz gerekmektedir.
              </Text>
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => {
                  update('acceptedTerms', true);
                  setShowTermsModal(false);
                }}
              >
                <Text style={styles.modalButtonText}>Kabul Ediyorum</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F4C4C' },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 24, paddingBottom: 24, alignItems: 'center', gap: 16 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  backBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  title: { color: 'white', fontSize: 18, fontWeight: '700' },
  placeholder: { width: 40 },
  label: { color: 'white', marginBottom: 6, letterSpacing: 1 },
  underline: { borderBottomWidth: 1.5, borderBottomColor: 'white', color: 'white', paddingVertical: 8 },
  btn: { backgroundColor: 'white', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 28, marginTop: 10 },
  btnText: { color: '#0F4C4C', fontWeight: '800' },
  btnDisabled: { opacity: 0.6 },
  linkBtn: { paddingVertical: 8 },
  linkBtnText: { color: 'white', textDecorationLine: 'underline' },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    width: '100%',
  },
  dropdownButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dropdownText: {
    fontSize: 16,
    color: 'white',
  },
  dropdownTextDisabled: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  dropdownContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    width: '100%',
    maxHeight: 200,
  },
  dropdownList: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#0F4C4C',
  },
  termsContainer: {
    width: '100%',
    marginTop: 8,
    marginBottom: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  termsText: {
    flex: 1,
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    lineHeight: 20,
  },
  termsLink: {
    color: '#93c5fd',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F4C4C',
    flex: 1,
  },
  modalBody: {
    padding: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F4C4C',
    marginTop: 16,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 12,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  modalButton: {
    backgroundColor: '#0F4C4C',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  externalLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  externalLinkText: {
    color: '#0F4C4C',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

