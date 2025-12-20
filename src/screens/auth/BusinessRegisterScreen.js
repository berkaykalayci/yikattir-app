import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Text, TouchableOpacity, ScrollView, Alert, Modal, KeyboardAvoidingView, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { logError } from '../../utils/errorMessages';

export default function BusinessRegisterScreen({ navigation }) {
  const { register } = useAuth();
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState({ 
    name: '', 
    tcNo: '', 
    vergiNo: '', 
    phone: '', 
    address: '', 
    city: '', 
    district: '', 
    email: '', 
    password: '', 
    passwordConfirm: '',
    acceptedTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const cities = [
    { value: 'İstanbul', districts: ['Adalar', 'Arnavutköy', 'Ataşehir', 'Avcılar', 'Bağcılar', 'Bahçelievler', 'Bakırköy', 'Başakşehir', 'Bayrampaşa', 'Beşiktaş', 'Beykoz', 'Beylikdüzü', 'Beyoğlu', 'Büyükçekmece', 'Çatalca', 'Çekmeköy', 'Esenler', 'Esenyurt', 'Eyüpsultan', 'Fatih', 'Gaziosmanpaşa', 'Güngören', 'Kadıköy', 'Kağıthane', 'Kartal', 'Küçükçekmece', 'Maltepe', 'Pendik', 'Sancaktepe', 'Sarıyer', 'Silivri', 'Sultanbeyli', 'Sultangazi', 'Şile', 'Şişli', 'Tuzla', 'Ümraniye', 'Üsküdar', 'Zeytinburnu'] },
    { value: 'Ankara', districts: ['Akyurt', 'Altındağ', 'Ayaş', 'Bala', 'Beypazarı', 'Çamlıdere', 'Çankaya', 'Çubuk', 'Elmadağ', 'Etimesgut', 'Evren', 'Gölbaşı', 'Güdül', 'Haymana', 'Kalecik', 'Kazan', 'Keçiören', 'Kızılcahamam', 'Mamak', 'Nallıhan', 'Polatlı', 'Pursaklar', 'Sincan', 'Şereflikoçhisar', 'Yenimahalle'] },
    { value: 'İzmir', districts: ['Aliağa', 'Balçova', 'Bayındır', 'Bayraklı', 'Bergama', 'Beydağ', 'Bornova', 'Buca', 'Çeşme', 'Çiğli', 'Dikili', 'Foça', 'Gaziemir', 'Güzelbahçe', 'Karabağlar', 'Karaburun', 'Karşıyaka', 'Kemalpaşa', 'Kınık', 'Kiraz', 'Konak', 'Menderes', 'Menemen', 'Narlıdere', 'Ödemiş', 'Seferihisar', 'Selçuk', 'Tire', 'Torbalı', 'Urla'] },
    { value: 'Bursa', districts: ['Büyükorhan', 'Gemlik', 'Gürsu', 'Harmancık', 'İnegöl', 'İznik', 'Karacabey', 'Keles', 'Kestel', 'Mudanya', 'Mustafakemalpaşa', 'Nilüfer', 'Orhaneli', 'Orhangazi', 'Osmangazi', 'Yenişehir', 'Yıldırım'] },
    { value: 'Antalya', districts: ['Akseki', 'Aksu', 'Alanya', 'Demre', 'Döşemealtı', 'Elmalı', 'Finike', 'Gazipaşa', 'Gündoğmuş', 'İbradı', 'Kaş', 'Kemer', 'Kepez', 'Konyaaltı', 'Korkuteli', 'Kumluca', 'Manavgat', 'Muratpaşa', 'Serik'] },
    { value: 'Balıkesir', districts: ['Altıeylül', 'Ayvalık', 'Balya', 'Bandırma', 'Bigadiç', 'Burhaniye', 'Dursunbey', 'Edremit', 'Erdek', 'Gömeç', 'Gönen', 'Havran', 'İvrindi', 'Karesi', 'Kepsut', 'Manyas', 'Marmara', 'Savaştepe', 'Sındırgı', 'Susurluk'] },
    { value: 'Adana', districts: ['Aladağ', 'Ceyhan', 'Çukurova', 'Feke', 'İmamoğlu', 'Karaisalı', 'Karataş', 'Kozan', 'Pozantı', 'Saimbeyli', 'Sarıçam', 'Seyhan', 'Tufanbeyli', 'Yumurtalık', 'Yüreğir'] },
    { value: 'Adıyaman', districts: ['Besni', 'Çelikhan', 'Gerger', 'Gölbaşı', 'Kahta', 'Merkez', 'Samsat', 'Sincik', 'Tut'] },
    { value: 'Afyonkarahisar', districts: ['Başmakçı', 'Bayat', 'Bolvadin', 'Çay', 'Çobanlar', 'Dazkırı', 'Dinar', 'Emirdağ', 'Evciler', 'Hocalar', 'İhsaniye', 'İscehisar', 'Kızılören', 'Merkez', 'Sandıklı', 'Sinanpaşa', 'Sultandağı', 'Şuhut'] },
    { value: 'Ağrı', districts: ['Diyadin', 'Doğubayazıt', 'Eleşkirt', 'Hamur', 'Merkez', 'Patnos', 'Taşlıçay', 'Tutak'] },
    { value: 'Amasya', districts: ['Göynücek', 'Gümüşhacıköy', 'Hamamözü', 'Merkez', 'Merzifon', 'Suluova', 'Taşova'] },
    { value: 'Artvin', districts: ['Ardanuç', 'Arhavi', 'Borçka', 'Hopa', 'Merkez', 'Murgul', 'Şavşat', 'Yusufeli'] },
    { value: 'Aydın', districts: ['Bozdoğan', 'Buharkent', 'Çine', 'Didim', 'Efeler', 'Germencik', 'İncirliova', 'Karacasu', 'Karpuzlu', 'Koçarlı', 'Köşk', 'Kuşadası', 'Kuyucak', 'Nazilli', 'Söke', 'Sultanhisar', 'Yenipazar'] },
    { value: 'Bartın', districts: ['Amasra', 'Kurucaşile', 'Merkez', 'Ulus'] },
    { value: 'Batman', districts: ['Beşiri', 'Gercüş', 'Hasankeyf', 'Kozluk', 'Merkez', 'Sason'] },
    { value: 'Bayburt', districts: ['Aydıntepe', 'Demirözü', 'Merkez'] },
    { value: 'Bilecik', districts: ['Bozüyük', 'Gölpazarı', 'İnhisar', 'Merkez', 'Osmaneli', 'Pazaryeri', 'Söğüt', 'Yenipazar'] },
    { value: 'Bingöl', districts: ['Adaklı', 'Genç', 'Karlıova', 'Kiğı', 'Merkez', 'Solhan', 'Yayladere', 'Yedisu'] },
    { value: 'Bitlis', districts: ['Adilcevaz', 'Ahlat', 'Güroymak', 'Hizan', 'Merkez', 'Mutki', 'Tatvan'] },
    { value: 'Bolu', districts: ['Dörtdivan', 'Gerede', 'Göynük', 'Kıbrıscık', 'Mengen', 'Merkez', 'Mudurnu', 'Seben', 'Yeniçağa'] },
    { value: 'Burdur', districts: ['Ağlasun', 'Altınyayla', 'Bucak', 'Çavdır', 'Çeltikçi', 'Gölhisar', 'Karamanlı', 'Kemer', 'Merkez', 'Tefenni', 'Yeşilova'] },
    { value: 'Çanakkale', districts: ['Ayvacık', 'Bayramiç', 'Biga', 'Bozcaada', 'Çan', 'Eceabat', 'Ezine', 'Gelibolu', 'Gökçeada', 'Lapseki', 'Merkez', 'Yenice'] },
    { value: 'Çankırı', districts: ['Atkaracalar', 'Bayramören', 'Çerkeş', 'Eldivan', 'Ilgaz', 'Kızılırmak', 'Korgun', 'Kurşunlu', 'Merkez', 'Orta', 'Şabanözü', 'Yapraklı'] },
    { value: 'Çorum', districts: ['Alaca', 'Bayat', 'Boğazkale', 'Dodurga', 'İskilip', 'Kargı', 'Laçin', 'Mecitözü', 'Merkez', 'Oğuzlar', 'Ortaköy', 'Osmancık', 'Sungurlu', 'Uğurludağ'] },
    { value: 'Denizli', districts: ['Acıpayam', 'Babadağ', 'Baklan', 'Bekilli', 'Beyağaç', 'Bozkurt', 'Buldan', 'Çal', 'Çameli', 'Çardak', 'Çivril', 'Güney', 'Honaz', 'Kale', 'Merkezefendi', 'Pamukkale', 'Sarayköy', 'Serinhisar', 'Tavas'] },
    { value: 'Diyarbakır', districts: ['Bağlar', 'Bismil', 'Çermik', 'Çınar', 'Çüngüş', 'Dicle', 'Eğil', 'Ergani', 'Hani', 'Hazro', 'Kayapınar', 'Kocaköy', 'Kulp', 'Lice', 'Silvan', 'Sur', 'Yenişehir'] },
    { value: 'Düzce', districts: ['Akçakoca', 'Cumayeri', 'Çilimli', 'Gölyaka', 'Gümüşova', 'Kaynaşlı', 'Merkez', 'Yığılca'] },
    { value: 'Edirne', districts: ['Enez', 'Havsa', 'İpsala', 'Keşan', 'Lalapaşa', 'Meriç', 'Merkez', 'Süloğlu', 'Uzunköprü'] },
    { value: 'Elazığ', districts: ['Ağın', 'Alacakaya', 'Arıcak', 'Baskil', 'Karakoçan', 'Keban', 'Kovancılar', 'Maden', 'Merkez', 'Palu', 'Sivrice'] },
    { value: 'Erzincan', districts: ['Çayırlı', 'İliç', 'Kemah', 'Kemaliye', 'Merkez', 'Otlukbeli', 'Refahiye', 'Tercan', 'Üzümlü'] },
    { value: 'Erzurum', districts: ['Aşkale', 'Aziziye', 'Çat', 'Hınıs', 'Horasan', 'İspir', 'Karaçoban', 'Karayazı', 'Köprüköy', 'Narman', 'Oltu', 'Olur', 'Palandöken', 'Pasinler', 'Pazaryolu', 'Şenkaya', 'Tekman', 'Tortum', 'Uzundere', 'Yakutiye'] },
    { value: 'Eskişehir', districts: ['Alpu', 'Beylikova', 'Çifteler', 'Günyüzü', 'Han', 'İnönü', 'Mahmudiye', 'Mihalgazi', 'Mihalıççık', 'Odunpazarı', 'Sarıcakaya', 'Seyitgazi', 'Sivrihisar', 'Tepebaşı'] },
    { value: 'Gaziantep', districts: ['Araban', 'İslahiye', 'Karkamış', 'Nizip', 'Nurdağı', 'Oğuzeli', 'Şahinbey', 'Şehitkamil', 'Yavuzeli'] },
    { value: 'Giresun', districts: ['Alucra', 'Bulancak', 'Çamoluk', 'Çanakçı', 'Dereli', 'Doğankent', 'Espiye', 'Eynesil', 'Görele', 'Keşap', 'Merkez', 'Piraziz', 'Şebinkarahisar', 'Tirebolu', 'Yağlıdere'] },
    { value: 'Gümüşhane', districts: ['Kelkit', 'Köse', 'Kürtün', 'Merkez', 'Şiran', 'Torul'] },
    { value: 'Hakkari', districts: ['Çukurca', 'Derecik', 'Merkez', 'Şemdinli', 'Yüksekova'] },
    { value: 'Hatay', districts: ['Altınözü', 'Antakya', 'Arsuz', 'Belen', 'Defne', 'Dörtyol', 'Erzin', 'Hassa', 'İskenderun', 'Kırıkhan', 'Kumlu', 'Payas', 'Reyhanlı', 'Samandağ', 'Yayladağı'] },
    { value: 'Iğdır', districts: ['Aralık', 'Karakoyunlu', 'Merkez', 'Tuzluca'] },
    { value: 'Isparta', districts: ['Aksu', 'Atabey', 'Eğirdir', 'Gelendost', 'Gönen', 'Keçiborlu', 'Merkez', 'Senirkent', 'Sütçüler', 'Şarkikaraağaç', 'Uluborlu', 'Yalvaç', 'Yenişarbademli'] },
    { value: 'Mersin', districts: ['Akdeniz', 'Anamur', 'Aydıncık', 'Bozyazı', 'Çamlıyayla', 'Erdemli', 'Gülnar', 'Mezitli', 'Mut', 'Silifke', 'Tarsus', 'Toroslar', 'Yenişehir'] },
    { value: 'Muğla', districts: ['Bodrum', 'Dalaman', 'Datça', 'Fethiye', 'Kavaklıdere', 'Köyceğiz', 'Marmaris', 'Menteşe', 'Milas', 'Ortaca', 'Seydikemer', 'Ula', 'Yatağan'] },
    { value: 'Muş', districts: ['Bulanık', 'Hasköy', 'Korkut', 'Malazgirt', 'Merkez', 'Varto'] },
    { value: 'Nevşehir', districts: ['Acıgöl', 'Avanos', 'Derinkuyu', 'Gülşehir', 'Hacıbektaş', 'Kozaklı', 'Merkez', 'Ürgüp'] },
    { value: 'Niğde', districts: ['Altunhisar', 'Bor', 'Çamardı', 'Çiftlik', 'Merkez', 'Ulukışla'] },
    { value: 'Ordu', districts: ['Akkuş', 'Altınordu', 'Aybastı', 'Çamaş', 'Çatalpınar', 'Çaybaşı', 'Fatsa', 'Gölköy', 'Gülyalı', 'Gürgentepe', 'İkizce', 'Kabadüz', 'Kabataş', 'Korgan', 'Kumru', 'Mesudiye', 'Perşembe', 'Piraziz', 'Ulubey', 'Ünye'] },
    { value: 'Rize', districts: ['Ardeşen', 'Çamlıhemşin', 'Çayeli', 'Derepazarı', 'Fındıklı', 'Güneysu', 'Hemşin', 'İkizdere', 'İyidere', 'Kalkandere', 'Merkez', 'Pazar'] },
    { value: 'Sakarya', districts: ['Adapazarı', 'Akyazı', 'Arifiye', 'Erenler', 'Ferizli', 'Geyve', 'Hendek', 'Karapürçek', 'Karasu', 'Kaynarca', 'Kocaali', 'Pamukova', 'Sapanca', 'Serdivan', 'Söğütlü', 'Taraklı'] },
    { value: 'Samsun', districts: ['19 Mayıs', 'Alaçam', 'Asarcık', 'Atakum', 'Ayvacık', 'Bafra', 'Canik', 'Çarşamba', 'Havza', 'İlkadım', 'Kavak', 'Ladik', 'Ondokuzmayıs', 'Salıpazarı', 'Tekkeköy', 'Terme', 'Vezirköprü', 'Yakakent'] },
    { value: 'Siirt', districts: ['Baykan', 'Eruh', 'Kurtalan', 'Merkez', 'Pervari', 'Şirvan'] },
    { value: 'Sinop', districts: ['Ayancık', 'Boyabat', 'Dikmen', 'Durağan', 'Erfelek', 'Gerze', 'Merkez', 'Saraydüzü', 'Türkeli'] },
    { value: 'Sivas', districts: ['Akıncılar', 'Altınyayla', 'Divriği', 'Doğanşar', 'Gemerek', 'Gölova', 'Gürün', 'Hafik', 'İmranlı', 'Kangal', 'Koyulhisar', 'Merkez', 'Suşehri', 'Şarkışla', 'Ulaş', 'Yıldızeli', 'Zara'] },
    { value: 'Şanlıurfa', districts: ['Akçakale', 'Birecik', 'Bozova', 'Ceylanpınar', 'Eyyübiye', 'Halfeti', 'Haliliye', 'Harran', 'Hilvan', 'Karaköprü', 'Siverek', 'Suruç', 'Viranşehir'] },
    { value: 'Şırnak', districts: ['Beytüşşebap', 'Cizre', 'Güçlükonak', 'İdil', 'Merkez', 'Silopi', 'Uludere'] },
    { value: 'Tekirdağ', districts: ['Çerkezköy', 'Çorlu', 'Ergene', 'Hayrabolu', 'Kapaklı', 'Malkara', 'Marmaraereğlisi', 'Muratlı', 'Saray', 'Süleymanpaşa', 'Şarköy'] },
    { value: 'Tokat', districts: ['Almus', 'Artova', 'Başçiftlik', 'Erbaa', 'Merkez', 'Niksar', 'Pazar', 'Reşadiye', 'Sulusaray', 'Turhal', 'Yeşilyurt', 'Zile'] },
    { value: 'Trabzon', districts: ['Akçaabat', 'Araklı', 'Arsin', 'Beşikdüzü', 'Çarşıbaşı', 'Çaykara', 'Dernekpazarı', 'Düzköy', 'Hayrat', 'Köprübaşı', 'Maçka', 'Of', 'Ortahisar', 'Sürmene', 'Şalpazarı', 'Tonya', 'Vakfıkebir', 'Yomra'] },
    { value: 'Tunceli', districts: ['Çemişgezek', 'Hozat', 'Mazgirt', 'Merkez', 'Nazımiye', 'Ovacık', 'Pertek', 'Pülümür'] },
    { value: 'Uşak', districts: ['Banaz', 'Eşme', 'Karahallı', 'Merkez', 'Sivaslı', 'Ulubey'] },
    { value: 'Van', districts: ['Bahçesaray', 'Başkale', 'Çaldıran', 'Çatak', 'Edremit', 'Erciş', 'Gevaş', 'Gürpınar', 'İpekyolu', 'Muradiye', 'Özalp', 'Saray', 'Tuşba'] },
    { value: 'Yalova', districts: ['Altınova', 'Armutlu', 'Çınarcık', 'Çiftlikköy', 'Merkez', 'Termal'] },
    { value: 'Yozgat', districts: ['Akdağmadeni', 'Aydıncık', 'Boğazlıyan', 'Çandır', 'Çayıralan', 'Çekerek', 'Kadışehri', 'Merkez', 'Saraykent', 'Sarıkaya', 'Sorgun', 'Şefaatli', 'Yenifakılı', 'Yerköy'] },
    { value: 'Zonguldak', districts: ['Alaplı', 'Çaycuma', 'Devrek', 'Gökçebey', 'Kilimli', 'Kozlu', 'Merkez'] }
  ];
  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const cleaned = phone.replace(/\s/g, '').replace(/[()-]/g, '');
    const turkishPhoneRegex = /^(0|90|\+90)?5[0-9]{9}$/;
    return turkishPhoneRegex.test(cleaned);
  };

  const validateTCNo = (tcNo) => {
    const cleaned = tcNo.replace(/\s/g, '');
    return /^\d{11}$/.test(cleaned);
  };

  const validateVergiNo = (vergiNo) => {
    const cleaned = vergiNo.replace(/\s/g, '');
    return /^\d{10}$/.test(cleaned);
  };

  const submit = async () => {
    if (!form.name.trim()) return Alert.alert('Uyarı', 'İşletme adı zorunlu');
    if (!form.tcNo.trim()) return Alert.alert('Uyarı', 'T.C. Kimlik No zorunlu');
    if (!validateTCNo(form.tcNo.trim())) return Alert.alert('Uyarı', 'T.C. Kimlik No 11 haneli olmalıdır.');
    if (!form.vergiNo.trim()) return Alert.alert('Uyarı', 'Vergi No zorunlu');
    if (!validateVergiNo(form.vergiNo.trim())) return Alert.alert('Uyarı', 'Vergi No 10 haneli olmalıdır.');
    if (!form.phone.trim()) return Alert.alert('Uyarı', 'Telefon zorunlu');
    if (!validatePhone(form.phone.trim())) return Alert.alert('Uyarı', 'Geçerli bir telefon numarası giriniz. (Örn: 05XX XXX XX XX)');
    if (!form.address.trim()) return Alert.alert('Uyarı', 'Adres zorunlu');
    if (!form.city.trim()) return Alert.alert('Uyarı', 'İl seçimi zorunlu');
    if (!form.district.trim()) return Alert.alert('Uyarı', 'İlçe seçimi zorunlu');
    if (!form.email.trim()) return Alert.alert('Uyarı', 'E-Posta zorunlu');
    if (!validateEmail(form.email.trim())) return Alert.alert('Uyarı', 'Geçerli bir e-posta adresi giriniz.');
    if (!form.password.trim()) return Alert.alert('Uyarı', 'Şifre zorunlu');
    if (form.password !== form.passwordConfirm) return Alert.alert('Uyarı', 'Şifreler eşleşmiyor');
    if (!form.acceptedTerms) return Alert.alert('Uyarı', 'Kullanıcı sözleşmesini kabul etmelisiniz.');

    try {
      setLoading(true);
      const result = await register(
        form.name.trim(),
        form.email.trim(),
        form.phone.trim(),
        form.password,
        form.city.trim(), // city
        form.district.trim(), // district
        'BUSINESS', // role
        form.address.trim(), // address
        form.tcNo.trim(), // tcNo
        form.vergiNo.trim() // vergiNo
      );
      
      if (result.success) {
        Alert.alert('Başarılı', 'İşletme kaydınız oluşturuldu');
      } else {
        Alert.alert('Kayıt Hatası', result.error);
      }
    } catch (error) {
      logError('$(basename "$file" .js)', 'Hata');
      Alert.alert('Hata', 'Kayıt işlemi başarısız');
    } finally {
      setLoading(false);
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
        <Text style={styles.title}>İŞLETME KAYIT</Text>
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
      >
        <View style={{ width: '100%' }}>
          <Text style={styles.label}>İŞLETME ADI</Text>
          <TextInput style={styles.underline} value={form.name} onChangeText={(t)=>update('name',t)} />
        </View>
        <View style={{ width: '100%' }}>
          <Text style={styles.label}>T.C. KİMLİK NO</Text>
          <TextInput 
            style={styles.underline} 
            value={form.tcNo} 
            onChangeText={(t) => update('tcNo', t.replace(/\D/g, ''))} 
            keyboardType="numeric" 
            maxLength={11}
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
          />
        </View>
        <View style={{ width: '100%' }}>
          <Text style={styles.label}>VERGİ NO</Text>
          <TextInput 
            style={styles.underline} 
            value={form.vergiNo} 
            onChangeText={(t) => update('vergiNo', t.replace(/\D/g, ''))} 
            keyboardType="numeric" 
            maxLength={10}
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
          />
        </View>
        <View style={{ width: '100%' }}>
          <Text style={styles.label}>TELEFON</Text>
          <TextInput 
            style={styles.underline} 
            value={form.phone} 
            onChangeText={(t) => update('phone', t)} 
            keyboardType="phone-pad" 
            placeholder="05XX XXX XX XX"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
          />
        </View>
        <View style={{ width: '100%' }}>
          <Text style={styles.label}>ADRES</Text>
          <TextInput style={styles.underline} value={form.address} onChangeText={(t)=>update('address',t)} multiline />
        </View>
        
        {/* İl ve İlçe Seçimi */}
        <View style={styles.row}>
          <View style={[styles.halfWidth, { marginRight: 8 }]}>
            <Text style={styles.label}>İL</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowCityModal(true)}
            >
              <Text style={[styles.dropdownText, !form.city && styles.placeholderText]}>
                {form.city || 'İl seçin'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#0F4C4C" />
            </TouchableOpacity>
          </View>
          <View style={[styles.halfWidth, { marginLeft: 8 }]}>
            <Text style={styles.label}>İLÇE</Text>
            <TouchableOpacity
              style={[styles.dropdownButton, !form.city && styles.dropdownButtonDisabled]}
              onPress={() => form.city && setShowDistrictModal(true)}
              disabled={!form.city}
            >
              <Text style={[
                styles.dropdownText, 
                !form.district && styles.placeholderText,
                !form.city && styles.disabledText
              ]}>
                {form.district || (form.city ? 'İlçe seçin' : 'Önce il seçin')}
              </Text>
              <Ionicons 
                name="chevron-down" 
                size={20} 
                color={form.city ? "#0F4C4C" : "#9ca3af"} 
              />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={{ width: '100%' }}>
          <Text style={styles.label}>E-POSTA</Text>
          <TextInput 
            style={styles.underline} 
            value={form.email} 
            onChangeText={(t) => update('email', t)} 
            keyboardType="email-address" 
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
          />
        </View>
        <View style={{ width: '100%' }}>
          <Text style={styles.label}>ŞİFRE</Text>
          <TextInput 
            style={styles.underline} 
            value={form.password} 
            onChangeText={(t)=>update('password',t)} 
            secureTextEntry
            returnKeyType="next"
            blurOnSubmit={false}
          />
        </View>
        <View style={{ width: '100%' }}>
          <Text style={styles.label}>ŞİFRE ONAY</Text>
          <TextInput 
            style={styles.underline} 
            value={form.passwordConfirm} 
            onChangeText={(t)=>update('passwordConfirm',t)} 
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={submit}
          />
        </View>

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
          onPress={submit}
          disabled={loading || !form.acceptedTerms}
        >
          <Text style={styles.btnText}>{loading ? 'Kayıt oluşturuluyor...' : 'KAYIT OL !'}</Text>
        </TouchableOpacity>
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* İl Seçim Modal'ı */}
      <Modal
        visible={showCityModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>İl Seçin</Text>
              <TouchableOpacity onPress={() => setShowCityModal(false)}>
                <Ionicons name="close" size={24} color="#0F4C4C" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {cities.map((cityItem) => (
                <TouchableOpacity
                  key={cityItem.value}
                  style={[
                    styles.modalItem,
                    form.city === cityItem.value && styles.modalItemSelected
                  ]}
                  onPress={() => {
                    update('city', cityItem.value);
                    update('district', ''); // İl değiştiğinde ilçeyi sıfırla
                    setShowCityModal(false);
                  }}
                >
                  <Text style={[
                    styles.modalItemText,
                    form.city === cityItem.value && styles.modalItemTextSelected
                  ]}>
                    {cityItem.value}
                  </Text>
                  {form.city === cityItem.value && (
                    <Ionicons name="checkmark" size={20} color="#0F4C4C" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* İlçe Seçim Modal'ı */}
      <Modal
        visible={showDistrictModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDistrictModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>İlçe Seçin</Text>
              <TouchableOpacity onPress={() => setShowDistrictModal(false)}>
                <Ionicons name="close" size={24} color="#0F4C4C" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {form.city ? (
                cities.find(c => c.value === form.city)?.districts.map((districtItem) => (
                  <TouchableOpacity
                    key={districtItem}
                    style={[
                      styles.modalItem,
                      form.district === districtItem && styles.modalItemSelected
                    ]}
                    onPress={() => {
                      update('district', districtItem);
                      setShowDistrictModal(false);
                    }}
                  >
                    <Text style={[
                      styles.modalItemText,
                      form.district === districtItem && styles.modalItemTextSelected
                    ]}>
                      {districtItem}
                    </Text>
                    {form.district === districtItem && (
                      <Ionicons name="checkmark" size={20} color="#0F4C4C" />
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.modalItem}>
                  <Text style={styles.modalItemText}>Önce bir il seçin</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Kullanıcı Sözleşmesi Modal'ı */}
      <Modal
        visible={showTermsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.termsModalContent]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Kullanıcı Sözleşmesi ve Gizlilik Politikası</Text>
              <TouchableOpacity onPress={() => setShowTermsModal(false)}>
                <Ionicons name="close" size={24} color="#0F4C4C" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalSectionTitle}>1. Kullanıcı Sözleşmesi</Text>
              <Text style={styles.modalText}>
                Bu sözleşme, YIKATTIR uygulamasını kullanarak hizmet vermek isteyen işletmeler ile uygulama sahibi arasındaki hak ve yükümlülükleri düzenler.
              </Text>
              <Text style={styles.modalText}>
                • Uygulamayı kullanarak, bu sözleşmeyi kabul etmiş sayılırsınız.{'\n'}
                • İşletme bilgilerinizi doğru ve güncel tutmakla yükümlüsünüz.{'\n'}
                • Randevu yönetimi ve müşteri ilişkilerinde profesyonel davranmakla yükümlüsünüz.{'\n'}
                • Uygulamayı yasalara aykırı amaçlarla kullanamazsınız.
              </Text>

              <Text style={styles.modalSectionTitle}>2. Gizlilik Politikası</Text>
              <Text style={styles.modalText}>
                Kişisel verileriniz 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında işlenmektedir.
              </Text>
              <Text style={styles.modalText}>
                • İşletme bilgileriniz platformda görüntülenir.{'\n'}
                • Müşteri bilgileri sadece randevu yönetimi için kullanılır.{'\n'}
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
                Uygulama, işletmeler ve hizmetler hakkında bilgi sağlar ancak hizmet kalitesinden sorumlu değildir. Müşterilerle olan anlaşmazlıklarınızı doğrudan müşteri ile çözmeniz gerekmektedir.
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
      </KeyboardAvoidingView>
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
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#0F4C4C', fontWeight: '800' },
  row: {
    flexDirection: 'row',
    width: '100%',
  },
  halfWidth: {
    flex: 1,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
  dropdownButtonDisabled: {
    opacity: 0.5,
  },
  dropdownText: {
    color: 'white',
    fontSize: 16,
    flex: 1,
  },
  placeholderText: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  disabledText: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxHeight: '70%',
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
  },
  modalList: {
    maxHeight: 300,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalItemSelected: {
    backgroundColor: '#f0f9ff',
  },
  modalItemText: {
    fontSize: 16,
    color: '#111827',
  },
  modalItemTextSelected: {
    color: '#0F4C4C',
    fontWeight: '600',
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
  termsModalContent: {
    maxHeight: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
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

