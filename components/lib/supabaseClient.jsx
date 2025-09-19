import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const expoExtra = Constants?.expoConfig?.extra ?? Constants?.manifest?.extra ?? {};

const supabaseUrl = expoExtra.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = expoExtra.supabaseKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('[supabaseClient] Falta configuración de Supabase. Revisa app.json -> expo.extra o variables de entorno.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Recomendado en RN/Expo
  },
});