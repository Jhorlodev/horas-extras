import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  Switch,
  TouchableOpacity,
  Pressable,
  Platform,
  Image,
  Modal,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
  Dimensions,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { supabase } from './lib/supabaseClient';
import DataFetch from './DataFetch'


const screenWidth = Dimensions.get('window').width;
const diasCortos = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const url = 'https://unavatar.io/lopezyhorman';
const InputForm = ({ onDataAdded, refreshTrigger }) => {
  const [fecha, setFecha] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userImage, setUserImage] = useState('');
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    const getUserEmail = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user?.email) {
          setUserEmail(user.email);
          setUserImage(user.user_metadata?.avatar_url || '');
        }
      } catch (error) {
        console.error('Error al obtener el correo:', error);
      }
    };
    getUserEmail();
  }, []);

  const [horas, setHoras] = useState('');
  const [sueldoBase, setSueldoBase] = useState('');
  const [tipoHora, setTipoHora] = useState('');
  const [bonoNoche, setBonoNoche] = useState(false);
  const [valorBono, setValorBono] = useState('');
  const [detalleBono, setDetalleBono] = useState('');

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [rangeModalVisible, setRangeModalVisible] = useState(false);
  const [totalHorasRango, setTotalHorasRango] = useState(0);
  const [horasSemana, setHorasSemana] = useState(0);
  const [horasFin, setHorasFin] = useState(0);
  const [rangeRows, setRangeRows] = useState([]);
  const buscarHorasPorRango = async () => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id;
      if (!uid) return;

      const fechaInicio = dayjs(startDate).format('YYYY-MM-DD');
      const fechaFin = dayjs(endDate).format('YYYY-MM-DD');

      const { data, error } = await supabase
        .from('horas_extras')
        .select('horas, fecha')
        .eq('usuario_id', uid)
        .gte('fecha', fechaInicio)
        .lte('fecha', fechaFin);

      if (error) throw error;

      const rows = Array.isArray(data) ? data : [];
      const rowsSorted = rows
        .map((r) => ({ ...r, fechaNum: dayjs(r.fecha).valueOf() }))
        .sort((a, b) => a.fechaNum - b.fechaNum)
        .map(({ fechaNum, ...rest }) => rest);
      const totals = rows.reduce(
        (acc, it) => {
          const h = Number(it.horas) || 0;
          const d = dayjs(it.fecha).day();
          if (d === 0 || d === 6) acc.weekend += h;
          else acc.weekday += h;
          acc.total += h;
          return acc;
        },
        { weekday: 0, weekend: 0, total: 0 }
      );
      setRangeRows(rowsSorted);
      setHorasSemana(totals.weekday);
      setHorasFin(totals.weekend);
      setTotalHorasRango(totals.total);
      setRangeModalVisible(true);
    } catch (e) {
      console.log('Error al buscar horas por rango:', e);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.log('Error al cerrar sesión:', e);
    }
  };

  const addPost = async () => {
    const fechaFormateada =
      fecha instanceof Date ? fecha.toISOString().split('T')[0] : String(fecha);
    const horasNum = horas !== '' && horas !== null ? parseFloat(horas) : null;
    const sueldoBaseNum =
      sueldoBase !== '' && sueldoBase !== null ? parseFloat(sueldoBase) : null;
    const valorBonoNum =
      valorBono !== '' && valorBono !== null ? parseFloat(valorBono) : null;

    const valorHora = sueldoBaseNum ? sueldoBaseNum * 0.0079545 : null;
    const totalPago =
      horasNum != null && valorHora != null ? horasNum * valorHora : null;

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
      fecha: fechaFormateada,
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

    const { error } = await supabase.from('horas_extras').insert([payload]);

    if (error) {
      console.log('Error adding data:', error);
    } else {
      setHoras('');
      setSueldoBase('');
      setTipoHora('');
      setBonoNoche(false);
      setValorBono('');
      setDetalleBono('');

      console.log('Registro agregado exitosamente');
      if (onDataAdded) {
        onDataAdded();
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#2a2a2a" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <View style={styles.headerSection}>
              <TouchableOpacity onPress={handleLogout} style={styles.logoutIcon}>
                <Icon name="close" size={28} color="#30D0C0" />
              </TouchableOpacity>
              <Text style={styles.userEmail} numberOfLines={1} ellipsizeMode="tail">
                {userEmail}
              </Text>
              
             

              {userImage ? (
                <Image
                  source={{ uri: userImage }}
                  style={[styles.avatar, imageLoading && styles.avatarLoading]}
                  onLoadStart={() => setImageLoading(true)}
                  onLoadEnd={() => setImageLoading(false)}
                  onError={() => setImageLoading(false)}
                />
              ) : userEmail ? (
                  <Image source={{ uri: url }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.placeholderText}>👤</Text>
                </View>
              )}
            </View>

          

            <View style={styles.form}>
              <Text style={styles.title}>Calculadora de Horas Extras</Text>

              <View style={styles.twoColumnContainer}>
                <View style={styles.column}>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    style={styles.inputWrapper}
                  >
                    <View pointerEvents="none" style={styles.dateInput}>
                      <TextInput
                        placeholder="Fecha (YYYY-MM-DD)"
                        value={
                          fecha instanceof Date ? fecha.toLocaleDateString('en-CA') : fecha.toString()
                        }
                        style={[styles.input, { flex: 1 }]}
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

              <View style={styles.rangeContainer}>
                <Text style={styles.rangeTitle}>Rango de fechas</Text>

                <View style={styles.rangeRow}>
                  <Pressable
                    style={styles.rangeDateBtn}
                    onPress={() => setShowStartPicker(true)}
                  >
                    <Text style={styles.rangeDateText}>
                      Desde: {dayjs(startDate).format('DD/MM/YYYY')}
                    </Text>
                  </Pressable>
                  {showStartPicker && (
                    <DateTimePicker
                      value={startDate}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, selectedDate) => {
                        setShowStartPicker(Platform.OS === 'ios');
                        if (selectedDate) {
                          setStartDate(selectedDate);
                          if (dayjs(selectedDate).isAfter(dayjs(endDate))) {
                            setEndDate(selectedDate);
                          }
                        }
                      }}
                    />
                  )}

                  <Pressable style={styles.rangeDateBtn} onPress={() => setShowEndPicker(true)}>
                    <Text style={styles.rangeDateText}>
                      Hasta: {dayjs(endDate).format('DD/MM/YYYY')}
                    </Text>
                  </Pressable>
                  {showEndPicker && (
                    <DateTimePicker
                      value={endDate}
                      minimumDate={startDate}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, selectedDate) => {
                        setShowEndPicker(Platform.OS === 'ios');
                        if (selectedDate) setEndDate(selectedDate);
                      }}
                    />
                  )}
                </View>
              </View>

              <Pressable
                onPress={buscarHorasPorRango}
                style={[styles.backgroundButton, styles.actionButton]}
              >
                <Text style={styles.buttonLabel}>Generar</Text>
              </Pressable>

              <Pressable
                onPress={addPost}
                style={[styles.backgroundButton, styles.actionButton]}
              >
                <Text style={[styles.buttonLabel, { color: '#121212', fontSize: 18 }]}>
                  Agregar
                </Text>
              </Pressable>
            </View>

            <Modal visible={rangeModalVisible} transparent animationType="fade">
              <View style={styles.modalOverlay}>
                <View style={styles.modalCard}>
                  <Text style={styles.modalHeader}>⏱️ Resumen de horas</Text>
                  <Text style={styles.modalSubheader}>
                    📅 {dayjs(startDate).format('DD/MM/YYYY')} →{' '}
                    {dayjs(endDate).format('DD/MM/YYYY')}
                  </Text>
                  {totalHorasRango === 0 ? (
                    <Text
                      style={{
                        color: '#ccc',
                        fontStyle: 'italic',
                        marginVertical: 10,
                        textAlign: 'center',
                      }}
                    >
                      No hay datos para este rango.
                    </Text>
                  ) : (
                    <>
                      <View style={styles.tableContainer}>
                        <View style={styles.tableHeader}>
                          <Text style={[styles.headerCell, { flex: 1.2 }]}>Fecha</Text>
                          <Text style={[styles.headerCell, { flex: 1 }]}>Día</Text>
                          <Text style={[styles.headerCell, { flex: 1, textAlign: 'right' }]}>Horas</Text>
                          <Text style={[styles.headerCell, { width: 28, textAlign: 'center' }]}>⏱️</Text>
                        </View>
                        <View style={{ maxHeight: 220 }}>
                          <ScrollView>
                            {rangeRows.map((row, idx) => {
                              const d = dayjs(row.fecha);
                              const dayIdx = d.day();
                              const isWeekend = dayIdx === 0 || dayIdx === 6;
                              return (
                                <View key={`${row.fecha}-${idx}`} style={styles.tableRow}>
                                  <Text style={[styles.cell, { flex: 1.2 }]}>{d.format('DD/MM/YYYY')}</Text>
                                  <Text style={[styles.cell, { flex: 1 }]}>{diasCortos[dayIdx]}</Text>
                                  <Text style={[styles.cell, { flex: 1, textAlign: 'right', color: '#40E0D0', fontWeight: '700' }]}>
                                    {(Number(row.horas) || 0).toFixed(2)}
                                  </Text>
                                  <View style={{ width: 28, alignItems: 'center' }}>
                                    {isWeekend ? (
                                      <Icon name="weekend" size={18} color="#f5a623" />
                                    ) : (
                                      <Icon name="work" size={18} color="#30D0C0" />
                                    )}
                                  </View>
                                </View>
                              );
                            })}
                          </ScrollView>
                        </View>
                      </View>

                      <View style={styles.summaryRow}>
                        <Icon name="work" size={18} color="#40E0D0" />
                        <Text style={styles.summaryLabel}>🗓️ Días de semana</Text>
                        <Text style={styles.summaryValue}>{horasSemana.toFixed(2)} h</Text>
                      </View>

                      <View style={styles.summaryRow}>
                        <Icon name="weekend" size={18} color="#40E0D0" />
                        <Text style={styles.summaryLabel}>🛌 Fin de semana</Text>
                        <Text style={styles.summaryValue}>{horasFin.toFixed(2)} h</Text>
                      </View>

                      <View style={styles.separator} />

                      <View style={[styles.summaryRow, { marginTop: 4 }]}>
                        <Text style={[styles.summaryLabel, { fontWeight: '700' }]}>✅ Total</Text>
                        <Text style={[styles.summaryValue, { fontWeight: '800' }]}>
                          {totalHorasRango.toFixed(2)} h
                        </Text>
                      </View>
                    </>
                  )}

                  <Pressable style={styles.closeButton} onPress={() => setRangeModalVisible(false)}>
                    <Text style={styles.closeButtonText}>Cerrar</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>

           
            <View style={styles.dataFetchContainer}>
              <DataFetch refreshTrigger={refreshTrigger} />
            </View>
            <Text>hola</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2a2a2a',
  },
  formContainer: {
    flex: 1,
    marginHorizontal: 16,
    alignItems: 'center',
    paddingTop: 45,
    paddingBottom: 30,
    width: '90%',
    alignSelf: 'center',
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  logoutIcon: {
    padding: 4,
  },
  userEmail: {
    flex: 1,
    color: '#e5e5e5',
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 14,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarLoading: {
    opacity: 0.5,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 20,
  },
  form: {
    width: '100%',
    maxWidth: 650,
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
  title: {
    color: '#40E0D0',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  twoColumnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  column: {
    width: '48%',
  },
  inputWrapper: {
    marginBottom: 12,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputText: {
    color: '#e5e5e5',
    fontSize: 16,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#30D0C0',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#3a3a3a',
    color: '#e5e5e5',
    fontSize: 16,
    textAlign: 'center',
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
  backgroundButton: {
    backgroundColor: '#30D0C0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    height: 45,
  },
  actionButton: {
    width: screenWidth * 0.7,
    alignSelf: 'center',
  },
  buttonLabel: {
    color: '#121212',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  rangeContainer: {
    width: '100%',
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  rangeTitle: {
    color: '#e5e5e5',
    fontWeight: '600',
    marginBottom: 4,
  },
  rangeRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    justifyContent: 'space-between',
  },
  rangeDateBtn: {
    borderColor: '#30D0C0',
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#3a3a3a',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  rangeDateText: {
    color: '#e5e5e5',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#30d0c9',
  },
  modalHeader: {
    color: '#40E0D0',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubheader: {
    color: '#e5e5e5',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryLabel: {
    color: '#e5e5e5',
    fontSize: 14,
    flex: 1,
    marginLeft: 8,
  },
  summaryValue: {
    color: '#40E0D0',
    fontSize: 16,
    fontWeight: '700',
  },
  separator: {
    height: 1,
    backgroundColor: '#3a3a3a',
    marginVertical: 8,
  },
  closeButton: {
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: '#30D0C0',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#121212',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dataFetchContainer: {
    marginTop: 20,
    width: '100%',
    backgroundColor: '#394545',
    borderRadius: 8,
    padding: 10,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#3a3a3a',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#343434',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  headerCell: {
    color: '#bbb',
    fontSize: 12,
    fontWeight: '700',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  cell: {
    color: '#e5e5e5',
    fontSize: 14,
  },
 
});

export default InputForm;
