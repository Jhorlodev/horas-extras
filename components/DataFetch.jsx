import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, Pressable, RefreshControl, Modal } from 'react-native';
import { supabase } from './lib/supabaseClient';



export default function DataFetch({ refreshTrigger }) {
  const [posts, setPosts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const PAGE_SIZE = 10;

  const fetchPosts = useCallback(async (uid = userId, pageNum = 1, append = false) => {
    if (!uid) return;
    const from = (pageNum - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from('horas_extras')
      .select('*')
      .eq('usuario_id', uid)
      .order('fecha', { ascending: false })
      .range(from, to);

    if (error) {
      if (!append) setPosts([]);
      console.log('Error fetching data:', error);
    } else {
      if (append) {
        setPosts((prev) => [...prev, ...data]);
      } else {
        setPosts(data);
      }
      setHasMore(data.length === PAGE_SIZE);
    }
  }, [userId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await fetchPosts(userId, 1, false);
    setRefreshing(false);
  }, [fetchPosts, userId]);

  useEffect(() => {
    let channel;
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data?.user?.id ?? null;
      setUserId(uid);
      setPage(1);
      await fetchPosts(uid, 1, false);

      if (uid) {
        channel = supabase
          .channel('horas_extras_changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'horas_extras', filter: `usuario_id=eq.${uid}` },
            () => {
              setPage(1);
              fetchPosts(uid, 1, false);
            }
          )
          .subscribe();
      }
    };

    init();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchPosts]);

  // Recargar cuando cambie refreshTrigger
  useEffect(() => {
    if (userId && refreshTrigger > 0) {
      setPage(1);
      fetchPosts(userId, 1, false);
    }
  }, [refreshTrigger, userId, fetchPosts]);

  const renderItem = ({ item }) => (
    <Pressable
      onPress={() => {
        setSelectedItem(item);
        setModalVisible(true);
      }}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}
    >
      <Text style={[styles.cell, { flex: 1.2 }]}>
        {item?.fecha ? new Date(item.fecha + 'T12:00:00').toLocaleDateString('es-ES') : '—'}
      </Text>
      <Text style={[styles.cell, { flex: 1.2 }]}>{item.horas}</Text>
      <Text style={[styles.cell, { flex: 1.2 }]}>{item.valor_hora}</Text>
      <Text style={[styles.cell, { flex: 1.2 }]}>{(item.total_pago).toFixed(0)}</Text>
    </Pressable>
  );

  const deletePost = async (id) => {
    const { error } = await supabase
      .from('horas_extras')
      .delete()
      .eq('id', id);
    if (error) {
      console.log('Error al eliminar registro:', error);
    } else {
      await fetchPosts(userId, 1, false);
      setModalVisible(false);
    }
  };


  return (
    <View style={styles.screen}>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Detalles</Text>
          <Text style={styles.modalText}>{selectedItem?.fecha}</Text>
          <Text style={styles.modalText}>{selectedItem?.detalle_bono}</Text>
          <Text style={styles.modalText}>horas extra:  {selectedItem?.horas}</Text>
          <Text style={styles.modalText}>valor hora:  {selectedItem?.valor_hora}</Text>
          <Text style={styles.modalText}>total pago:  {selectedItem?.total_pago}</Text>
          <Pressable style={styles.modalButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.modalButtonText}>Cerrar</Text>
          </Pressable>
          <Pressable style={styles.modalButton} onPress={() => deletePost(selectedItem?.id)}>
            <Text style={styles.modalButtonText}>Eliminar</Text>
          </Pressable>
        </View>
      </Modal>

      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, { flex: 1.2 }]}>Fecha</Text>
        <Text style={[styles.headerCell, { flex: 1.2 }]}>Horas</Text>
        <Text style={[styles.headerCell, { flex: 1.2 }]}>Valor</Text>
        <Text style={[styles.headerCell, { flex: 1.2 }]}>Total</Text>
      </View>
      <View style={styles.listContainer}>
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id?.toString?.() ?? String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 10 }}
          ListEmptyComponent={<Text style={{ color: '#e5e5e5', textAlign: 'center', margin: 20 }}>No hay datos registrados</Text>}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#30D0C0']}
              tintColor="#30D0C0"
            />
          }
          onEndReached={async () => {
            if (loadingMore || !hasMore) return;
            setLoadingMore(true);
            const nextPage = page + 1;
            await fetchPosts(userId, nextPage, true);
            setPage(nextPage);
            setLoadingMore(false);
          }}
          onEndReachedThreshold={0.2}
          ListFooterComponent={loadingMore ? (
            <Text style={{ color: '#e5e5e5', textAlign: 'center', margin: 10 }}>Cargando más...</Text>
          ) : null}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    width: '100%',
    padding: 12,
    backgroundColor: '#121212',
    borderRadius: 8,
    paddingTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  listContainer: {
    maxHeight: 350, 
    paddingVertical: 10,
    width: '100%',
    flexGrow: 0,
  },
  headerRow: {
    
    flexDirection: 'row',
    backgroundColor: '#30D0C0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    textAlign: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#121212',

  },
  headerCell: {
    color: '#121212',
    fontWeight: '700',
    fontSize: 14,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#181818',
    borderRadius: 8,
    margin: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#30d0c9',
  },
  cell: {
    color: '#e5e5e5',
    fontSize: 14,
    textAlign: 'center',
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
    fontSize: 14,
  },
  errorText: {
    color: '#e5e5e5',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 20,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#30D0C0',
    margin: 15,
    
  },

  modalTitle: {
    fontSize: 50,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#fff',
  },

  modalButtonContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButtonText: {
    color: '#121212',

    fontWeight: '700',
    fontSize: 14,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  modalButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 60,
    backgroundColor: '#30D0C0',
    borderRadius: 8,
    margin: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#30d0c9',
  },
  modalText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
});