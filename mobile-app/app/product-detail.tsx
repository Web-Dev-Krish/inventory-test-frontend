import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';

interface Product {
  id: string; name: string; code: string; quantity: number; barcode: string;
}

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);

  const fetchProduct = async () => {
    const { data } = await supabase.from('products').select('*').eq('id', id).single();
    if (data) setProduct(data);
  };

  useEffect(() => { fetchProduct(); }, [id]);

  const updateStock = async (type: 'in' | 'out') => {
    if (!product) return;
    const qty = type === 'in' ? 8 : 3;
    const newQty = type === 'in' ? product.quantity + qty : Math.max(0, product.quantity - qty);

    await supabase.from('products').update({ quantity: newQty }).eq('id', product.id);
    await supabase.from('stock_transactions').insert([{
      product_id: product.id, type, quantity: qty, notes: 'Mobile Update', created_at: new Date().toISOString()
    }]);

    Alert.alert('Success', `${type.toUpperCase()} ${qty} units updated`);
    fetchProduct();
  };

  const uploadPhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (result.canceled) return;

    const file = result.assets[0];
    const fileName = `${product?.id}-${Date.now()}.jpg`;

    const response = await fetch(file.uri);
    const blob = await response.blob();

    const { data, error } = await supabase.storage.from('product-photos').upload(fileName, blob);
    if (error) return Alert.alert('Upload failed', error.message);

    const { data: urlData } = supabase.storage.from('product-photos').getPublicUrl(fileName);
    await supabase.from('product_images').insert([{
      product_id: product!.id,
      image_url: urlData.publicUrl,
      uploaded_by: 'mobile',
      created_at: new Date().toISOString()
    }]);

    Alert.alert('Success', 'Photo uploaded to inventory');
  };

  if (!product) return <Text style={{ padding: 20 }}>Loading...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.meta}>Code: {product.code} • Barcode: {product.barcode}</Text>
      <Text style={styles.qty}>Current Stock: {product.quantity}</Text>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.btn, { backgroundColor: '#15803d' }]} onPress={() => updateStock('in')}>
          <Text style={styles.btnText}>STOCK IN +8</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, { backgroundColor: '#b91c1c' }]} onPress={() => updateStock('out')}>
          <Text style={styles.btnText}>STOCK OUT -3</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.uploadBtn} onPress={uploadPhoto}>
        <Text style={{ color: '#fff', fontWeight: '600' }}>Take & Upload Photo</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 30 }}>
        <Text style={{ color: '#666', textAlign: 'center' }}>Back to Scanner</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f8f9fa' },
  name: { fontSize: 26, fontWeight: 'bold', color: '#1e3a5f' },
  meta: { color: '#555', marginTop: 8 },
  qty: { fontSize: 18, fontWeight: '600', marginTop: 20, color: '#d4af37' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 32 },
  btn: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  uploadBtn: { marginTop: 24, backgroundColor: '#1e3a5f', padding: 18, borderRadius: 12, alignItems: 'center' },
});
