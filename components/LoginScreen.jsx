import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { supabase } from './lib/supabaseClient';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const signIn = async () => {
    setLoading(true);
    setError('');
    setInfo('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  const signUp = async () => {
    setLoading(true);
    setError('');
    setInfo('');
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setError(error.message);
    else setInfo('Revisa tu correo para confirmar la cuenta.');
    setLoading(false);
  };

  const perfil = async () => {
    const { data } = await supabase.from('profiles').insert({ email, password });
    console.log(data);
  };

  useEffect(() => {
    perfil();
  }, [email, password]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inicia sesión</Text>

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#9aa0a6"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#9aa0a6"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      {!!error && <Text style={styles.error}>{error}</Text>}
      {!!info && <Text style={styles.info}>{info}</Text>}

      <Pressable onPress={signIn} style={[styles.button, { opacity: loading ? 0.7 : 1 }]} disabled={loading}>
        <Text style={styles.buttonText}>Entrar</Text>
      </Pressable>

      <Pressable onPress={signUp} style={[styles.secondaryButton, { opacity: loading ? 0.7 : 1 }]} disabled={loading}>
        <Text style={styles.secondaryButtonText}>Crear cuenta</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#40E0D0',
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 12,
  },
  input: {
    width: '100%',
    height: 44,
    borderColor: '#30D0C0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#e5e5e5',
    backgroundColor: '#1f1f1f',
  },
  button: {
    width: '100%',
    backgroundColor: '#30D0C0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#121212',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: 'transparent',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#30D0C0',
  },
  secondaryButtonText: {
    color: '#30D0C0',
    fontWeight: 'bold',
    fontSize: 16,
  },
  error: {
    color: '#ff6b6b',
    marginBottom: 8,
  },
  info: {
    color: '#e5e5e5',
    marginBottom: 8,
  },
});
