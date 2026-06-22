import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';

interface Product {
  id: string;
  name: string;
  code: string;
  quantity: number;
  category: string;
  location: string;
  unit: string;
}

export default function Inventory() {
  const [items, setItems] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [filterLocation, setFilterLocation] = useState('All');

  const fetchItems = async () => {
    const { data } = await supabase.from('products').select('*');
    if (data) setItems(data);
  };

  useEffect(() => { fetchItems(); }, []);

  const updateQuantity = async (id: string, newQty: number) => {
    if (newQty < 0) return;
    await supabase.from('products').update({ quantity: newQty }).eq('id', id);
    fetchItems();
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) &&
    (filterLocation === 'All' || item.location === filterLocation)
  );

  const locations = ['All', ...new Set(items.map(i => i.location).filter(Boolean))];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inventory Management</Text>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Search inventory..."
        placeholderTextColor="#888"
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.filters}>
        {locations.map(loc => (
          <TouchableOpacity key={loc} style={[styles.filterChip, filterLocation === loc && styles.filterActive]} onPress={() => setFilterLocation(loc)}>
            <Text style={filterLocation === loc ? styles.filterActiveText : styles.filterText}>{loc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.status}>{item.quantity > 0 ? 'In Stock' : 'Out of Stock'}</Text>
            </View>
            <Text style={styles.meta}>{item.code} • {item.location} • {item.unit}</Text>
            
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.id, item.quantity - 1)}><Text style={styles.qtyBtnText}>-</Text></TouchableOpacity>
              <Text style={styles.qty}>{item.quantity}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.id, item.quantity + 1)}><Text style={styles.qtyBtnText}>+</Text></TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 16 },
  header: { marginTop: 50, marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '700', color: '#fff' },
  search: { backgroundColor: '#1E293B', color: '#fff', padding: 14, borderRadius: 12, marginBottom: 12, fontSize: 16 },
  filters: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, backgroundColor: '#1E293B', borderRadius: 20 },
  filterActive: { backgroundColor: '#C8960C' },
  filterText: { color: '#aaa' },
  filterActiveText: { color: '#1A2744', fontWeight: '600' },
  card: { backgroundColor: '#1E293B', padding: 18, borderRadius: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  itemName: { fontSize: 18, fontWeight: '600', color: '#fff' },
  status: { color: '#4ADE80', fontSize: 13 },
  meta: { color: '#94A3B8', marginTop: 4, marginBottom: 12 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  qtyBtn: { width: 40, height: 40, backgroundColor: '#334155', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { color: '#C8960C', fontSize: 24, fontWeight: '600' },
  qty: { color: '#fff', fontSize: 22, fontWeight: '700', minWidth: 40, textAlign: 'center' },
});
