import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, Switch, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import DataFetch from './DataFetch';

const InputForm = () => {
  const [fecha, setFecha] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [horasExtras, setHorasExtras] = useState('');
  const [sueldoBase, setSueldoBase] = useState('');
  const [tipoHora, setTipoHora] = useState('');
  const [bonoNoche, setBonoNoche] = useState(false);
  const [valorBono, setValorBono] = useState('');
  const [detalleBono, setDetalleBono] = useState('');

  return (
    <View style={styles.formContainer}>
      <View style={styles.form}>
        <Text style={styles.title}>Calculadora de Horas Extras</Text>
        
        <View style={styles.twoColumnContainer}>
          <View style={styles.column}>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.inputWrapper}>
              <View pointerEvents="none">
                <TextInput
                  placeholder="Fecha (YYYY-MM-DD)"
                  value={fecha.toISOString().slice(0, 10)}
                  style={styles.input}
                  editable={false}
                />
              </View>
            </TouchableOpacity>
            
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="Horas Extras"
                value={horasExtras}
                onChangeText={setHorasExtras}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
            
          
            
            {bonoNoche && (
              <View style={styles.inputWrapper}>
                <TextInput
                  placeholder="Valor del Bono"
                  value={valorBono}
                  onChangeText={setValorBono}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
            )}
          </View>
          
          <View style={styles.column}>
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="Sueldo Base"
                value={sueldoBase}
                onChangeText={setSueldoBase}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
            
            <View style={[styles.switchContainer, styles.inputWrapper]}>
              <Text style={styles.switchText}>Bono noche</Text>
              <Switch
                value={bonoNoche}
                onValueChange={setBonoNoche}
                trackColor={{ false: '#767577', true: '#30D0C0' }}
                thumbColor={bonoNoche ? '#f4f3f4' : '#f4f3f4'}
              />
            </View>
            
            {bonoNoche && (
              <View style={[styles.inputWrapper, { width: '100%' }]}>
                <TextInput
                  placeholder="Detalle del Bono"
                  value={detalleBono}
                  onChangeText={setDetalleBono}
                  style={[styles.input, { height: 60, width: '100%' }]}
                  multiline
                />
              </View>
            )}
          </View>
        </View>
        
        {showDatePicker && (
          <DateTimePicker
            value={fecha}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selectedDate) setFecha(selectedDate);
            }}
          />
        )}
      </View>
      <DataFetch /> 
    </View>
  );
}


const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    paddingTop: 45,
    padding: 20,
  },
  title: {
    color: '#40E0D0',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#2a2a2a',
  },

  form: {
    width: '100%',
    padding: 15,
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    shadowColor: '#30D0C0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  
  twoColumnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '75%',
  },
  
  column: {
    width: '65%',
    padding: 5,
    marginHorizontal: 5,
    marginVertical: 5,
    
  },
  
  inputWrapper: {
    marginBottom: 12,
    color: '#e5e5e5',
  },
  
  input: {
    width: '100%',
    height: 40,
    borderColor: '#30D0C0',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#3a3a3a',
    color: '#e5e5e5',
  },

  inputFull: {
    width: '100%',
    marginBottom: 15,
  },
 
  ScrollView: {
    width: '100%',
    padding: 20,
  },

  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderColor: '#30D0C0',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#3a3a3a',
    height: 40,
  },
  
  switchText: {
    color: '#e5e5e5',
  },
 backgoundButton: {
    backgroundColor: '#30D0C0',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default InputForm
