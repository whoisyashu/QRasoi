import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, SafeAreaView } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { useRouter } from 'expo-router';

export default function ScanQRScreen() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [manualInput, setManualInput] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    processQRData(data);
  };

  const processQRData = (rawUrl: string) => {
    try {
      // Parse URLs like: https://qrasoi.netlify.app/r/sample-cafe?table=Table%203
      let slug = 'sample-cafe';
      let table = 'Table 1';

      if (rawUrl.includes('/r/')) {
        const parts = rawUrl.split('/r/')[1];
        const [slugPart, queryPart] = parts.split('?');
        slug = slugPart || 'sample-cafe';
        if (queryPart && queryPart.includes('table=')) {
          const match = queryPart.match(/table=([^&]+)/);
          if (match) table = decodeURIComponent(match[1]);
        }
      } else if (rawUrl.trim()) {
        slug = rawUrl.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
      }

      Alert.alert(
        'QR Code Scanned! 📲',
        `Navigating to Digital Menu for ${slug} (${table})...`,
        [
          {
            text: 'Open Menu',
            onPress: () => {
              router.replace({
                pathname: '/(customer)/menu/[slug]',
                params: { slug, table },
              });
            },
          },
        ]
      );
    } catch (e) {
      Alert.alert('Scan Error', 'Invalid QR code format. Please try again.');
      setScanned(false);
    }
  };

  const handleManualSubmit = () => {
    if (!manualInput.trim()) {
      Alert.alert('Input Error', 'Please enter a valid restaurant slug (e.g. sample-cafe)');
      return;
    }
    processQRData(manualInput.trim());
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back to Gateway</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Scan Restaurant QR Code 📷</Text>
        <Text style={styles.subtitle}>Point your camera at any table QR poster</Text>
      </View>

      {hasPermission === true ? (
        <View style={styles.cameraContainer}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
          />
          <View style={styles.overlayFrame}>
            <View style={styles.cornerTopLeft} />
            <View style={styles.cornerTopRight} />
            <View style={styles.cornerBottomLeft} />
            <View style={styles.cornerBottomRight} />
          </View>
        </View>
      ) : (
        <View style={styles.noCameraBox}>
          <Text style={styles.noCameraText}>
            {hasPermission === false ? 'Camera permission denied.' : 'Requesting camera access...'}
          </Text>
        </View>
      )}

      {/* Manual Entry Fallback */}
      <View style={styles.manualCard}>
        <Text style={styles.manualTitle}>Or Enter Restaurant Code Manually</Text>
        <View style={styles.inputRow}>
          <TextInput
            value={manualInput}
            onChangeText={setManualInput}
            placeholder="e.g. sample-cafe"
            placeholderTextColor="#64748B"
            autoCapitalize="none"
            style={styles.manualInput}
          />
          <TouchableOpacity onPress={handleManualSubmit} style={styles.submitBtn}>
            <Text style={styles.submitBtnText}>Go →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    padding: 20,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  backBtn: {
    marginBottom: 8,
  },
  backBtnText: {
    color: '#EA580C',
    fontWeight: '700',
    fontSize: 13,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  overlayFrame: {
    position: 'absolute',
    top: '25%',
    left: '15%',
    width: '70%',
    height: '40%',
    borderWidth: 2,
    borderColor: '#EA580C',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  cornerTopLeft: { position: 'absolute', top: -4, left: -4, width: 24, height: 24, borderTopWidth: 4, borderLeftWidth: 4, borderColor: '#FFFFFF' },
  cornerTopRight: { position: 'absolute', top: -4, right: -4, width: 24, height: 24, borderTopWidth: 4, borderRightWidth: 4, borderColor: '#FFFFFF' },
  cornerBottomLeft: { position: 'absolute', bottom: -4, left: -4, width: 24, height: 24, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: '#FFFFFF' },
  cornerBottomRight: { position: 'absolute', bottom: -4, right: -4, width: 24, height: 24, borderBottomWidth: 4, borderRightWidth: 4, borderColor: '#FFFFFF' },
  noCameraBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noCameraText: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
  },
  manualCard: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  manualTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  manualInput: {
    flex: 1,
    backgroundColor: '#0F172A',
    color: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 20,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15,
  },
});
