import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, Switch, TouchableOpacity, Pressable, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import DataFetch from './DataFetch';
import { supabase } from './lib/supabaseClient';

const InputForm = () => {
  const [fecha, setFecha] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [horas, setHoras] = useState('');
  const [sueldoBase, setSueldoBase] = useState('');
  const [tipoHora, setTipoHora] = useState('');
  const [bonoNoche, setBonoNoche] = useState(false);
  const [valorBono, setValorBono] = useState('');
  const [detalleBono, setDetalleBono] = useState('');

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.log('Error al cerrar sesión:', e);
    }
  };

  const addPost = async () => {
    // Mapear los estados a los nombres de columnas esperados por la BD (snake_case)
    // y castear valores numéricos. También formatear fecha a YYYY-MM-DD.
    const fechaISO = fecha instanceof Date ? fecha.toISOString().slice(0, 10) : String(fecha);
    const horasNum = horas !== '' && horas !== null ? parseFloat(horas) : null;
    const sueldoBaseNum = sueldoBase !== '' && sueldoBase !== null ? parseFloat(sueldoBase) : null;
    const valorBonoNum = valorBono !== '' && valorBono !== null ? parseFloat(valorBono): null ;

    // Si tu tabla requiere estos campos calculados, los incluimos de forma opcional sin cambiar la UI
    const valorHora = sueldoBaseNum ? sueldoBaseNum * 0.0079545 : null;
    const totalPago = horasNum != null && valorHora != null ? horasNum * valorHora : null;

    // Obtener usuario autenticado para asociar el registro
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.log('Error obteniendo usuario:', authError);
      return;
    }
    const currentUser = authData?.user;
    if (!currentUser) {
      console.log('No hay usuario autenticado. Inicia sesión para continuar.');
      return;
    }

    const payload = {
      fecha: fechaISO,
      horas: horasNum,
      sueldo_base: sueldoBaseNum,
      tipo_horas: tipoHora || 'diurnas',
      bono_noche: !!bonoNoche,
      valor_bono: valorBonoNum,
      detalle_bono: detalleBono || null,
      valor_hora: valorHora,
      total_pago: totalPago,
      usuario_id: currentUser.id,
    };

    const { error } = await supabase
      .from('horas_extras')
      .insert([payload]);

    if (error) {
      console.log('Error adding data:', error);
    }
    else {
      setHoras('');
      setSueldoBase('');
      setTipoHora('');
      setBonoNoche(false);
      setValorBono('');
      setDetalleBono('');
    }
  };

  return (
    <View style={styles.formContainer}>
      <View style={styles.form}>
        <View style={styles.headerActions}>
          <Pressable onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
          </Pressable>
        </View>
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
                value={horas}
                onChangeText={setHoras}
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
              <Text style={styles.inputText}>Bono noche</Text>
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

        <Pressable onPress={addPost} style={styles.button}>
          <Text style={styles.buttonText}>Agregar</Text>
        </Pressable>
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
    rowGap: 20,
    
  },
  title: {
    color: '#40E0D0',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#2a2a2a',
    padding: 10,
  },

  form: {
    width: "auto",
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    shadowColor: '#30D0C0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },

  textInput: {
    color: '#e5e5e5',
    
  },

  headerActions: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 8,
  },

  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#30D0C0',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },

  logoutButtonText: {
    color: '#30D0C0',
    fontWeight: '600',
  },
  
  twoColumnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '75%',
  },
  
  column: {
    width: '65%',
    padding: 6,
    marginHorizontal: 5,
    marginVertical: 5,
    
    
  },
  
  inputWrapper: {
    marginBottom: 12,
    color: '#e5e5e5',
     
  },

  inputText: {
    color: '#e5e5e5',
    
  },
  
  input: {
    width: '100%',
    height: 40,
    borderColor: '#30D0C0',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius:  8,
    backgroundColor: '#3a3a3a',
    color: '#e5e5e5',
    fontSize: 16,
    textAlign: 'center',
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
    borderRadius: 8,
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
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    textAlign: 'center',
    backgroundColor: '#30D0C0', 
    padding: 10,
    borderRadius: 8,
    paddingHorizontal: 120,
  },
  
})

export default InputForm
