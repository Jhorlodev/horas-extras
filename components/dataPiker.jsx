import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';

const DateRangePicker = ({ onDateRangeSelected }) => {
  const today = new Date();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const handleStartDateChange = (event, selectedDate) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      // Si la fecha de inicio es mayor que la de fin, actualizamos la de fin
      if (dayjs(selectedDate).isAfter(dayjs(endDate))) {
        setEndDate(selectedDate);
      }
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndPicker(false);
    if (selectedDate && dayjs(selectedDate).isAfter(dayjs(startDate).subtract(1, 'day'))) {
      setEndDate(selectedDate);
    }
  };

  const formatDate = (date) => {
    return dayjs(date).format('DD/MM/YYYY');
  };

  return (
    <View style={styles.container}>
      <View style={styles.pickerContainer}>
        <Text>Desde:</Text>
        <Text 
          style={styles.dateText}
          onPress={() => setShowStartPicker(true)}
        >
          {formatDate(startDate)}
        </Text>
        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={handleStartDateChange}
            minimumDate={today}
          />
        )}
      </View>

      <View style={styles.pickerContainer}>
        <Text>Hasta:</Text>
        <Text 
          style={styles.dateText}
          onPress={() => setShowEndPicker(true)}
        >
          {formatDate(endDate)}
        </Text>
        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={handleEndDateChange}
            minimumDate={startDate}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateText: {
    marginLeft: 10,
    padding: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    minWidth: 100,
    textAlign: 'center',
  },
});

export default DateRangePicker;