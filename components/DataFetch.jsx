import React, { Component, useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator } from 'react-native';
import { supabase } from './lib/supabaseClient';



export default function DataFetch() { 

  const [data, setData] = useState([]);

  const fetchData = async () => {
    const { data: rows, error } = await supabase
      .from('horas_extras')
      .select('*')
      
    if (error) {
      alert('Error fetching data:', error);
    } else {
      setData(rows);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, { flex: 1.2 }]}>
        {item?.fecha ? new Date(item.fecha).toLocaleDateString() : '—'}
      </Text>
      <Text style={[styles.cell, { flex: 0.8 }]}>{String(item.horas ?? '—')}</Text>
      <Text style={[styles.cell, { flex: 1 }]}>{String(item.valor_hora ?? '—')}</Text>
      <Text style={[styles.cell, { flex: 1 }]}>{String(item.total_pago ?? '—')}</Text>
      
    </View>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, { flex: 0.5 }]}>Fecha</Text>
        <Text style={[styles.headerCell, { flex: 0.5 }]}>Horas</Text>
        <Text style={[styles.headerCell, { flex: 0.5 }]}>Valor</Text>
        <Text style={[styles.headerCell, { flex: 0.5 }]}>Total</Text>
       
      </View>
      <FlatList
        data={data}
        keyExtractor={(item, ) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 10 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: '100%',
    alignSelf: 'stretch',
    padding: 12,
    backgroundColor: '#121212',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#30D0C0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  headerCell: {
    color: '#121212',
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#181818',
    borderRadius: 6,
  },
  cell: {
    color: '#e5e5e5',
    fontSize: 12,
  },
  separator: {
    height: 8,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121212',
  },
  loaderText: {
    marginTop: 8,
    color: '#e5e5e5',
  },
  errorText: {
    color: '#e5e5e5',
  },
});