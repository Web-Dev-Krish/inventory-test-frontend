import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('labour@csjmu.ac.in');
  const [password, setPassword] = useState('user123');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      Alert.alert('Login Failed', error.message);
    } else {
      router.replace('/(tabs)');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>CS</Text>
        </View>
        <Text style={styles.title}>CSJMU Labour App</Text>
        <Text style={styles.subtitle}>Chhatrapati Shahu Ji Maharaj University</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>Demo: labour@csjmu.ac.in / user123</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { width: 80, height: 80, backgroundColor: '#C8960C', borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  logoText: { fontSize: 32, fontWeight: 'bold', color: '#1A2744' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { color: '#C8960C', marginTop: 4 },
  form: { backgroundColor: '#1E293B', padding: 24, borderRadius: 16 },
  input: { borderWidth: 1, borderColor: '#475569', padding: 14, borderRadius: 10, marginBottom: 16, fontSize: 16, color: '#fff' },
  button: { backgroundColor: '#C8960C', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#1A2744', fontSize: 16, fontWeight: '600' },
  hint: { color: '#94A3B8', textAlign: 'center', marginTop: 24, fontSize: 12 },
});
