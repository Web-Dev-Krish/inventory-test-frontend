import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function QRCodes() {
  const generateQR = () => Alert.alert('QR Generated', 'New QR code created and saved.');
  const exportQR = (type: string) => Alert.alert('Export', `${type} export started.`);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>QR Code Management</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Generate QR Codes</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={generateQR}><Text style={styles.btnText}>Generate New QR</Text></TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Export Options</Text>
        <View style={styles.row}>
          <TouchableOpacity style={styles.exportBtn} onPress={() => exportQR('PDF')}><Text style={styles.exportText}>PDF</Text></TouchableOpacity>
          <TouchableOpacity style={styles.exportBtn} onPress={() => exportQR('PNG')}><Text style={styles.exportText}>PNG</Text></TouchableOpacity>
          <TouchableOpacity style={styles.exportBtn} onPress={() => exportQR('CSV')}><Text style={styles.exportText}>CSV</Text></TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Configuration</Text>
        <Text style={styles.meta}>• Default Prefix: INV-</Text>
        <Text style={styles.meta}>• QR Size: 300px</Text>
        <Text style={styles.meta}>• Label Layout: Standard</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 20 },
  title: { fontSize: 26, fontWeight: '700', color: '#fff', marginTop: 60, marginBottom: 20 },
  card: { backgroundColor: '#1E293B', padding: 20, borderRadius: 16, marginBottom: 16 },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 16 },
  primaryBtn: { backgroundColor: '#C8960C', padding: 16, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#1A2744', fontWeight: '700' },
  row: { flexDirection: 'row', gap: 12 },
  exportBtn: { flex: 1, backgroundColor: '#334155', padding: 14, borderRadius: 10, alignItems: 'center' },
  exportText: { color: '#C8960C', fontWeight: '600' },
  meta: { color: '#94A3B8', marginTop: 6 },
});
