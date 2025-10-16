import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.31:3001';

export default function BusinessAddressScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState(null);
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showDistrictModal, setShowDistrictModal] = useState(false);

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
    { value: 'Konya', districts: ['Ahırlı', 'Akören', 'Akşehir', 'Altınekin', 'Beyşehir', 'Bozkır', 'Cihanbeyli', 'Çeltik', 'Çumra', 'Derbent', 'Derebucak', 'Doğanhisar', 'Emirgazi', 'Ereğli', 'Güneysinir', 'Hadim', 'Halkapınar', 'Hüyük', 'Ilgın', 'Kadınhanı', 'Karapınar', 'Karatay', 'Kulu', 'Meram', 'Sarayönü', 'Selçuklu', 'Seydişehir', 'Taşkent', 'Tuzlukçu', 'Yalıhüyük', 'Yunak'] },
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

  useEffect(() => {
    if (user) {
      loadBusinessAddress();
    }
  }, [user]);

  const loadBusinessAddress = async () => {
    try {
      console.log('İşletme adres bilgileri yükleniyor, user:', user);
      setLoading(true);
      
      // Önce işletme ID'sini bul
      const businessIdResponse = await axios.get(`${API_BASE_URL}/businesses/owner/${user.id}`);
      const foundBusinessId = businessIdResponse.data.id;
      setBusinessId(foundBusinessId);
      
      // İşletme bilgilerini API'den al
      const response = await axios.get(`${API_BASE_URL}/businesses/profile/${foundBusinessId}`);
      const businessData = response.data;
      
      console.log('API\'den gelen işletme adres bilgileri:', businessData);
      
      // Form alanlarını doldur
      setAddress(businessData.address || '');
      setDistrict(businessData.district || '');
      setCity(businessData.city || '');
      setPostalCode(businessData.postalCode || '');
      
    } catch (error) {
      console.error('İşletme adres bilgileri yüklenirken hata:', error);
      Alert.alert('Hata', 'Adres bilgileri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!businessId) {
        Alert.alert('Hata', 'İşletme ID bulunamadı');
        return;
      }

      const updateData = {
        address: address,
        district: district,
        city: city,
        postalCode: postalCode
      };

      console.log('Güncellenecek adres verisi:', updateData);
      
      await axios.patch(`${API_BASE_URL}/businesses/${businessId}`, updateData);
      
      Alert.alert('Başarılı', 'Adres bilgileri güncellendi');
      setIsEditing(false);
      
    } catch (error) {
      console.error('Adres güncelleme hatası:', error);
      Alert.alert('Hata', 'Adres bilgileri güncellenirken bir hata oluştu');
    }
  };


  const handleCancel = () => {
    setIsEditing(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Adres Bilgileri</Text>
          <View style={styles.editButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0F4C4C" />
          <Text style={styles.loadingText}>Adres bilgileri yükleniyor...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Adres Bilgileri</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Ionicons name={isEditing ? "close" : "create-outline"} size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adres Detayları</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Adres</Text>
            <TextInput
              style={[styles.textArea, !isEditing && styles.inputDisabled]}
              value={address}
              onChangeText={setAddress}
              editable={isEditing}
              placeholder="Tam adres bilgisini girin"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>İlçe</Text>
              <TouchableOpacity
                style={[styles.input, !isEditing && styles.inputDisabled]}
                onPress={() => isEditing && setShowDistrictModal(true)}
                disabled={!isEditing}
              >
                <Text style={[styles.inputText, !isEditing && styles.inputTextDisabled]}>
                  {district || 'İlçe seçin'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={isEditing ? "#0F4C4C" : "#9ca3af"} />
              </TouchableOpacity>
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>İl</Text>
              <TouchableOpacity
                style={[styles.input, !isEditing && styles.inputDisabled]}
                onPress={() => isEditing && setShowCityModal(true)}
                disabled={!isEditing}
              >
                <Text style={[styles.inputText, !isEditing && styles.inputTextDisabled]}>
                  {city || 'İl seçin'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={isEditing ? "#0F4C4C" : "#9ca3af"} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Posta Kodu</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={postalCode}
              onChangeText={setPostalCode}
              editable={isEditing}
              placeholder="Posta kodu"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Konum Bilgisi</Text>
          
          <View style={styles.mapCard}>
            <View style={styles.mapPlaceholder}>
              <Ionicons name="map" size={40} color="#0F4C4C" />
              <Text style={styles.mapText}>Harita Görünümü</Text>
              <Text style={styles.mapSubtext}>Konumunuz haritada gösterilecek</Text>
            </View>
            <TouchableOpacity style={styles.mapButton}>
              <Ionicons name="location" size={16} color="white" />
              <Text style={styles.mapButtonText}>Konumu Güncelle</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Teslimat Bilgileri</Text>
          
          <View style={styles.deliveryCard}>
            <View style={styles.deliveryItem}>
              <Ionicons name="car" size={20} color="#10b981" />
              <Text style={styles.deliveryText}>Araç ile ulaşım mümkün</Text>
            </View>
            <View style={styles.deliveryItem}>
              <Ionicons name="time" size={20} color="#f59e0b" />
              <Text style={styles.deliveryText}>Ortalama ulaşım süresi: 15 dk</Text>
            </View>
            <View style={styles.deliveryItem}>
              <Ionicons name="people" size={20} color="#3b82f6" />
              <Text style={styles.deliveryText}>Müşteri kapasitesi: 50+</Text>
            </View>
          </View>
        </View>

        {isEditing && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Şehir Seçim Modal'ı */}
      <Modal
        visible={showCityModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Şehir Seçin</Text>
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
                    city === cityItem.value && styles.modalItemSelected
                  ]}
                  onPress={() => {
                    setCity(cityItem.value);
                    setDistrict(''); // Şehir değiştiğinde ilçeyi sıfırla
                    setShowCityModal(false);
                  }}
                >
                  <Text style={[
                    styles.modalItemText,
                    city === cityItem.value && styles.modalItemTextSelected
                  ]}>
                    {cityItem.value}
                  </Text>
                  {city === cityItem.value && (
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
              {city ? (
                cities.find(c => c.value === city)?.districts.map((districtItem) => (
                  <TouchableOpacity
                    key={districtItem}
                    style={[
                      styles.modalItem,
                      district === districtItem && styles.modalItemSelected
                    ]}
                    onPress={() => {
                      setDistrict(districtItem);
                      setShowDistrictModal(false);
                    }}
                  >
                    <Text style={[
                      styles.modalItemText,
                      district === districtItem && styles.modalItemTextSelected
                    ]}>
                      {districtItem}
                    </Text>
                    {district === districtItem && (
                      <Ionicons name="checkmark" size={20} color="#0F4C4C" />
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.modalItem}>
                  <Text style={styles.modalItemText}>Önce bir şehir seçin</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    backgroundColor: '#0F4C4C',
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  editButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F4C4C',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  inputDisabled: {
    backgroundColor: '#f9fafb',
    color: '#6b7280',
  },
  textArea: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#d1d5db',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  mapCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mapPlaceholder: {
    alignItems: 'center',
    paddingVertical: 40,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    borderRadius: 8,
    marginBottom: 16,
  },
  mapText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
  },
  mapSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  mapButton: {
    backgroundColor: '#0F4C4C',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  deliveryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  deliveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  deliveryText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#0F4C4C',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  inputTextDisabled: {
    color: '#9ca3af',
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
});
