import React, { Component } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator } from 'react-native';
import { supabase } from './lib/supabaseClient';

export default class ExampleThree extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loading: true,
      error: null,
    };
  }

  async componentDidMount() {
    try {
      this.setState({ loading: true, error: null });
      const { data, error } = await supabase
        .from('horas_extras')
        .select('*');
      if (error) throw error;
      this.setState({ data: data ?? [] });
    } catch (e) {
      this.setState({ error: e.message ?? 'Error desconocido' });
    } finally {
      this.setState({ loading: false });
    }
  }

  render() {
    const { data, loading, error } = this.state;

    if (loading) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#30D0C0" />
          <Text style={styles.loaderText}>Cargando...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.loaderContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      );
    }

    return (
      <View style={styles.screen}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerCell, { flex: 1.2 }]}>Fecha</Text>
          <Text style={[styles.headerCell, { flex: 0.8 }]}>Horas</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>Tipo</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>Total</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>Estado</Text>
        </View>
        <FlatList
          data={data}
          keyExtractor={(item, index) => (item?.id != null ? String(item.id) : String(index))}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={[styles.cell, { flex: 1.2 }]}>
                {item?.fecha ? new Date(item.fecha).toLocaleDateString() : '—'}
              </Text>
              <Text style={[styles.cell, { flex: 0.8 }]}>{String(item.horasExtras ?? '—')}</Text>
              <Text style={[styles.cell, { flex: 1 }]}>{String(item.tipoHora ?? '—')}</Text>
              <Text style={[styles.cell, { flex: 1 }]}>{String(item.total ?? '—')}</Text>
              <Text style={[styles.cell, { flex: 1 }]}>{String(item.estado ?? 'pendiente')}</Text>
            </View>
          )}
          initialNumToRender={12}
          removeClippedSubviews
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      </View>
    );
  }
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