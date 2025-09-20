import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, Pressable, RefreshControl } from 'react-native';
import { supabase } from './lib/supabaseClient';



export default function DataFetch({ refreshTrigger }) {
  const [posts, setPosts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = useCallback(async (uid = userId) => {
    if (!uid) return;
    const { data, error } = await supabase
      .from('horas_extras')
      .select('*')
      .eq('usuario_id', uid)
      .order('fecha', { ascending: false });

    if (error) {
      setPosts([]);
      console.log('Error fetching data:', error);
    } else {
      setPosts(data);
    }
  }, [userId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  }, [fetchPosts]);

  useEffect(() => {
    let channel;
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data?.user?.id ?? null;
      setUserId(uid);
      await fetchPosts(uid);

      if (uid) {
        channel = supabase
          .channel('horas_extras_changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'horas_extras', filter: `usuario_id=eq.${uid}` },
            () => {
              fetchPosts(uid);
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
      fetchPosts(userId);
    }
  }, [refreshTrigger, userId, fetchPosts]);

 
  const [longPress, setLongPress] = useState(false);
 
  const renderItem = ({ item }) => (
    <View style={[styles.row, { opacity: longPress ? 0.6 : 1 }]} onLongPress={() => setLongPress(true)}>
      <Text style={[styles.cell, { flex: 1.2 }]}>
        {item?.fecha ? new Date(item.fecha + 'T12:00:00').toLocaleDateString('es-ES') : '—'}
      </Text>
      <Text style={[styles.cell, { flex: 1.2 }]}>{(item.horas)}</Text>
      <Text style={[styles.cell, { flex: 1.2 }]}>{(item.valor_hora)}</Text>
      <Text style={[styles.cell, { flex: 1.2 }]}>{((item.total_pago).toFixed(0))}</Text>


    </View>
         
  );

  const deletePost = async (id) => {
    const { error } = await supabase
      .from('horas_extras')
      .delete()
      .eq('id', id);
    if (error) console.log('Error deleting data:', error);
    setLongPress(false);
  };
  
  return (
    <View style={styles.screen}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, { flex: 1.2 }]}>Fecha</Text>
        <Text style={[styles.headerCell, { flex: 1.2 }]}>Horas</Text>
        <Text style={[styles.headerCell, { flex: 1.2 }]}>Valor</Text>
        <Text style={[styles.headerCell, { flex: 1.2 }]}>Total</Text>
       
      </View>
      <FlatList
        data={posts}
        keyExtractor={(item, ) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 10 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#30D0C0']}
            tintColor="#30D0C0"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: '100%',
    padding: 12,
    backgroundColor: '#121212',
    borderRadius: 8,
    paddingTop: 20,
    marginBottom: 20,
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
});