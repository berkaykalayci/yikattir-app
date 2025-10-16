import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import Screen from '../../components/layout/Screen';
import { Ionicons } from '@expo/vector-icons';

const TURKISH_CITIES = [
  { id: 1, name: 'Adana', plate: '01' },
  { id: 2, name: 'Adıyaman', plate: '02' },
  { id: 3, name: 'Afyonkarahisar', plate: '03' },
  { id: 4, name: 'Ağrı', plate: '04' },
  { id: 5, name: 'Amasya', plate: '05' },
  { id: 6, name: 'Ankara', plate: '06' },
  { id: 7, name: 'Antalya', plate: '07' },
  { id: 8, name: 'Artvin', plate: '08' },
  { id: 9, name: 'Aydın', plate: '09' },
  { id: 10, name: 'Balıkesir', plate: '10' },
  { id: 11, name: 'Bilecik', plate: '11' },
  { id: 12, name: 'Bingöl', plate: '12' },
  { id: 13, name: 'Bitlis', plate: '13' },
  { id: 14, name: 'Bolu', plate: '14' },
  { id: 15, name: 'Burdur', plate: '15' },
  { id: 16, name: 'Bursa', plate: '16' },
  { id: 17, name: 'Çanakkale', plate: '17' },
  { id: 18, name: 'Çankırı', plate: '18' },
  { id: 19, name: 'Çorum', plate: '19' },
  { id: 20, name: 'Denizli', plate: '20' },
  { id: 21, name: 'Diyarbakır', plate: '21' },
  { id: 22, name: 'Edirne', plate: '22' },
  { id: 23, name: 'Elazığ', plate: '23' },
  { id: 24, name: 'Erzincan', plate: '24' },
  { id: 25, name: 'Erzurum', plate: '25' },
  { id: 26, name: 'Eskişehir', plate: '26' },
  { id: 27, name: 'Gaziantep', plate: '27' },
  { id: 28, name: 'Giresun', plate: '28' },
  { id: 29, name: 'Gümüşhane', plate: '29' },
  { id: 30, name: 'Hakkari', plate: '30' },
  { id: 31, name: 'Hatay', plate: '31' },
  { id: 32, name: 'Isparta', plate: '32' },
  { id: 33, name: 'Mersin', plate: '33' },
  { id: 34, name: 'İstanbul', plate: '34' },
  { id: 35, name: 'İzmir', plate: '35' },
  { id: 36, name: 'Kars', plate: '36' },
  { id: 37, name: 'Kastamonu', plate: '37' },
  { id: 38, name: 'Kayseri', plate: '38' },
  { id: 39, name: 'Kırklareli', plate: '39' },
  { id: 40, name: 'Kırşehir', plate: '40' },
  { id: 41, name: 'Kocaeli', plate: '41' },
  { id: 42, name: 'Konya', plate: '42' },
  { id: 43, name: 'Kütahya', plate: '43' },
  { id: 44, name: 'Malatya', plate: '44' },
  { id: 45, name: 'Manisa', plate: '45' },
  { id: 46, name: 'Kahramanmaraş', plate: '46' },
  { id: 47, name: 'Mardin', plate: '47' },
  { id: 48, name: 'Muğla', plate: '48' },
  { id: 49, name: 'Muş', plate: '49' },
  { id: 50, name: 'Nevşehir', plate: '50' },
  { id: 51, name: 'Niğde', plate: '51' },
  { id: 52, name: 'Ordu', plate: '52' },
  { id: 53, name: 'Rize', plate: '53' },
  { id: 54, name: 'Sakarya', plate: '54' },
  { id: 55, name: 'Samsun', plate: '55' },
  { id: 56, name: 'Siirt', plate: '56' },
  { id: 57, name: 'Sinop', plate: '57' },
  { id: 58, name: 'Sivas', plate: '58' },
  { id: 59, name: 'Tekirdağ', plate: '59' },
  { id: 60, name: 'Tokat', plate: '60' },
  { id: 61, name: 'Trabzon', plate: '61' },
  { id: 62, name: 'Tunceli', plate: '62' },
  { id: 63, name: 'Şanlıurfa', plate: '63' },
  { id: 64, name: 'Uşak', plate: '64' },
  { id: 65, name: 'Van', plate: '65' },
  { id: 66, name: 'Yozgat', plate: '66' },
  { id: 67, name: 'Zonguldak', plate: '67' },
  { id: 68, name: 'Aksaray', plate: '68' },
  { id: 69, name: 'Bayburt', plate: '69' },
  { id: 70, name: 'Karaman', plate: '70' },
  { id: 71, name: 'Kırıkkale', plate: '71' },
  { id: 72, name: 'Batman', plate: '72' },
  { id: 73, name: 'Şırnak', plate: '73' },
  { id: 74, name: 'Bartın', plate: '74' },
  { id: 75, name: 'Ardahan', plate: '75' },
  { id: 76, name: 'Iğdır', plate: '76' },
  { id: 77, name: 'Yalova', plate: '77' },
  { id: 78, name: 'Karabük', plate: '78' },
  { id: 79, name: 'Kilis', plate: '79' },
  { id: 80, name: 'Osmaniye', plate: '80' },
  { id: 81, name: 'Düzce', plate: '81' },
];

export default function CitySelectionScreen({ navigation, route }) {
  const { onCitySelect } = route.params || {};
  const [selectedCity, setSelectedCity] = useState(null);

  const renderCity = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.cityCard, 
        selectedCity?.id === item.id && styles.cityCardSelected
      ]} 
      onPress={() => setSelectedCity(item)}
    >
      <Text style={[
        styles.plateNumber,
        selectedCity?.id === item.id && styles.plateNumberSelected
      ]}>
        {item.plate}
      </Text>
      <Text style={[
        styles.cityName,
        selectedCity?.id === item.id && styles.cityNameSelected
      ]}>
        {item.name}
      </Text>
      {selectedCity?.id === item.id && (
        <View style={styles.checkIcon}>
          <Ionicons name="checkmark-circle" size={20} color="#0F4C4C" />
        </View>
      )}
    </TouchableOpacity>
  );

  const handleApply = () => {
    if (selectedCity && onCitySelect) {
      onCitySelect(selectedCity);
    }
    navigation.goBack();
  };

  const handleCancel = () => {
    setSelectedCity(null);
    navigation.goBack();
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleCancel}>
          <Ionicons name="chevron-back" size={24} color="#0F4C4C" />
        </TouchableOpacity>
        <Text style={styles.title}>Şehir Seçin</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={TURKISH_CITIES}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCity}
        numColumns={3}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
      />

      {selectedCity && (
        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
          <Text style={styles.applyButtonText}>
            {selectedCity.name} Seç ({selectedCity.plate})
          </Text>
        </TouchableOpacity>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F4C4C',
  },
  placeholder: { width: 40 },
  listContainer: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cityCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
    aspectRatio: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  cityCardSelected: {
    backgroundColor: '#0F4C4C',
    borderWidth: 2,
    borderColor: '#0F4C4C',
  },
  plateNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F4C4C',
    marginBottom: 4,
  },
  plateNumberSelected: {
    color: 'white',
  },
  cityName: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  cityNameSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  checkIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  applyButton: {
    backgroundColor: '#0F4C4C',
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
