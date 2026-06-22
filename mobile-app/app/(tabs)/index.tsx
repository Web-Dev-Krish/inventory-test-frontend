import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function Dashboard() {
  const [stats, setStats] = useState({ totalItems: 0, totalUnits: 0, qrCodes: 0, locations: 0 });

  const fetchStats = async () => {
    const { data } = await supabase.from('products').select('*');
    if (data) {
      const uniqueLocs = new Set(data.map((p: any) => p.location).filter(Boolean));
      setStats({
        totalItems: data.length,
        totalUnits: data.reduce((sum: number, p: any) => sum + (p.quantity || 0), 0),
        qrCodes: data.length,
        locations: uniqueLocs.size,
      });
    }
  };

  useEffect(() => { fetchStats(); }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inventory Dashboard</Text>
        <Text style={styles.subtitle}>CSJMU QR Management System</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}><Text style={styles.statNumber}>{stats.totalItems}</Text><Text style={styles.statLabel}>Total Items</Text></View>
        <View style={styles.statCard}><Text style={styles.statNumber}>{stats.totalUnits}</Text><Text style={styles.statLabel}>Total Units</Text></View>
        <View style={styles.statCard}><Text style={styles.statNumber}>{stats.qrCodes}</Text><Text style={styles.statLabel}>QR Codes</Text></View>
        <View style={styles.statCard}><Text style={styles.statNumber}>{stats.locations}</Text><Text style={styles.statLabel}>Locations</Text></View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}><Text style={{ color: '#94A3B8' }}>All inventory operations are saved automatically.</Text></View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 20 },
  header: { marginTop: 60, marginBottom: 30 },
  title: { fontSize: 28, fontWeight: '700', color: '#fff' },
  subtitle: { color: '#64748B', marginTop: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { flex: 1, minWidth: '47%', backgroundColor: '#1E293B', padding: 20, borderRadius: 16, alignItems: 'center' },
  statNumber: { fontSize: 32, fontWeight: '700', color: '#C8960C' },
  statLabel: { color: '#94A3B8', marginTop: 6, fontSize: 14 },
  section: { marginTop: 30 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 12 },
  activityCard: { backgroundColor: '#1E293B', padding: 18, borderRadius: 16 },
});
