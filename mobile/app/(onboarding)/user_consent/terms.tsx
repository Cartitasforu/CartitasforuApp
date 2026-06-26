// app/onboarding/terms.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { TermsContent } from '@/components/TermsContent';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TERMS_VERSION = '1.0.0';

export default function TermsScreen() {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView | null>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isAtBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 40;
    if (isAtBottom) setHasScrolledToBottom(true);
  };
  const handleRead = async () => {
    // El botón sólo indica que el usuario leyó el documento.
    // El consentimiento real se registrará desde el onboarding cuando el usuario marque
    // el checkbox y pulse "Completar perfil".
    setLoading(true);
    try {
      // Guardamos un flag temporal para que el onboarding marque el checkbox
      await AsyncStorage.setItem('didReadTerms', 'true');
      // Volver al flujo anterior (onboarding)
      router.back();
    } catch (err) {
      console.log('Error returning to onboarding', err);
      Alert.alert('Error', 'No se pudo regresar al onboarding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Términos y Condiciones</Text>
      <Text style={styles.version}>Versión {TERMS_VERSION}</Text>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        onScroll={handleScroll}
        scrollEventThrottle={100}
      >
        <TermsContent />
      </ScrollView>

      {!hasScrolledToBottom && (
        <Text style={styles.scrollHint}>↓ Desplázate para leer todo el documento</Text>
      )}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRead}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>He leído</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        Al aceptar, confirmas que has leído y entendido estos términos.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  version: { fontSize: 12, color: '#666', marginBottom: 12 },
  scrollView: { flex: 1, marginBottom: 12 },
  scrollHint: { textAlign: 'center', color: '#666', marginBottom: 8 },
  button: {
    backgroundColor: '#8B0000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.5, backgroundColor: '#b8869b' },
  buttonText: { color: '#fff', fontWeight: '600' },
  disclaimer: { fontSize: 12, color: '#666', marginTop: 8, textAlign: 'center' },
});