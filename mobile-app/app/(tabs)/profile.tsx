import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function Profile() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Labour / User • CSJMU</Text>

      <TouchableOpacity style={styles.logout} onPress={handleLogout}>
        <Text style={{ color: '#fff', fontWeight: '600' }}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  subtitle: { color: '#64748B', marginTop: 8 },
  logout: { marginTop: 60, backgroundColor: '#C8960C', paddingVertical: 14, paddingHorizontal: 60, borderRadius: 12 },
});
