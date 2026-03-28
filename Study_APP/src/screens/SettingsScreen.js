// src/screens/SettingsScreen.js
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, StatusBar, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, AI_PROVIDERS } from '../constants';
import { getSettings, saveSettings } from '../utils/storage';
import { sendAIMessage } from '../utils/aiService';

export default function SettingsScreen({ navigation }) {
  const [settings, setSettings] = useState({ aiProvider: 'claude', apiKey: '', userName: 'Nishit' });
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);

  useFocusEffect(useCallback(() => {
    getSettings().then(setSettings);
  }, []));

  async function handleSave() {
    await saveSettings(settings);
    Alert.alert('Saved', 'Settings saved successfully.');
  }

  async function testConnection() {
    if (!settings.apiKey) { Alert.alert('No API key', 'Enter your API key first.'); return; }
    setTesting(true);
    try {
      const reply = await sendAIMessage(settings.aiProvider, settings.apiKey, [
        { role: 'user', content: 'Say "Connection successful!" and nothing else.' }
      ]);
      Alert.alert('✅ Connected!', reply);
    } catch (err) {
      Alert.alert('❌ Failed', err.message);
    }
    setTesting(false);
  }

  const selectedProvider = AI_PROVIDERS.find(p => p.id === settings.aiProvider);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
          <Text style={styles.saveTxt}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Profile */}
        <Text style={styles.sectionTitle}>Profile</Text>
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Your name</Text>
          <TextInput
            style={styles.input}
            value={settings.userName}
            onChangeText={v => setSettings(p => ({ ...p, userName: v }))}
            placeholder="Your name"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        {/* AI Provider */}
        <Text style={styles.sectionTitle}>AI Provider</Text>
        <View style={styles.card}>
          {AI_PROVIDERS.map(provider => (
            <TouchableOpacity
              key={provider.id}
              style={[styles.providerRow, settings.aiProvider === provider.id && styles.providerRowActive]}
              onPress={() => setSettings(p => ({ ...p, aiProvider: provider.id, apiKey: '' }))}
              activeOpacity={0.7}
            >
              <View style={styles.providerInfo}>
                <Text style={[styles.providerName, settings.aiProvider === provider.id && { color: COLORS.primary, fontWeight: '700' }]}>
                  {provider.name}
                </Text>
                <Text style={styles.providerModel}>{provider.model}</Text>
              </View>
              <View style={[styles.radioOuter, settings.aiProvider === provider.id && styles.radioOuterActive]}>
                {settings.aiProvider === provider.id && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* API Key */}
        <Text style={styles.sectionTitle}>API Key</Text>
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>
            {selectedProvider?.name} API Key
          </Text>
          <View style={styles.keyRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={settings.apiKey}
              onChangeText={v => setSettings(p => ({ ...p, apiKey: v }))}
              placeholder={selectedProvider?.keyPlaceholder || 'Enter API key'}
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry={!showKey}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={() => setShowKey(p => !p)} style={styles.eyeBtn}>
              <Ionicons name={showKey ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
          <Text style={styles.keyHint}>Your key is stored only on your device. Never shared.</Text>

          <TouchableOpacity
            style={[styles.testBtn, testing && { opacity: 0.6 }]}
            onPress={testConnection}
            disabled={testing}
          >
            <Ionicons name={testing ? 'sync-outline' : 'wifi-outline'} size={16} color={COLORS.teal} />
            <Text style={styles.testBtnText}>{testing ? 'Testing...' : 'Test connection'}</Text>
          </TouchableOpacity>
        </View>

        {/* How to get keys */}
        <Text style={styles.sectionTitle}>How to get API key</Text>
        <View style={styles.card}>
          {[
            { name: 'Claude (Anthropic)', url: 'console.anthropic.com', steps: 'Sign up → API Keys → Create key' },
            { name: 'ChatGPT (OpenAI)', url: 'platform.openai.com', steps: 'Sign up → API keys → Create new key' },
            { name: 'Gemini (Google)', url: 'aistudio.google.com', steps: 'Sign in → Get API key → Create' },
          ].map(item => (
            <View key={item.name} style={styles.keyGuideRow}>
              <Text style={styles.keyGuideName}>{item.name}</Text>
              <Text style={styles.keyGuideUrl}>{item.url}</Text>
              <Text style={styles.keyGuideSteps}>{item.steps}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingTop: 50, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.card, borderBottomWidth: 0.5, borderColor: COLORS.border },
  backBtn: { padding: 4 },
  headerTitle: { color: COLORS.textPrimary, fontSize: 17, fontWeight: '700' },
  saveBtn: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  saveTxt: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
  scroll: { flex: 1 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginHorizontal: 16, marginTop: 20, marginBottom: 8 },
  card: { marginHorizontal: 16, backgroundColor: COLORS.card, borderRadius: 14, padding: 16, borderWidth: 0.5, borderColor: COLORS.border },
  fieldLabel: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 0.5, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: COLORS.textPrimary, backgroundColor: '#fafafa' },
  keyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn: { padding: 10 },
  keyHint: { fontSize: 12, color: COLORS.textMuted, marginTop: 8 },
  testBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14, paddingTop: 12, borderTopWidth: 0.5, borderColor: COLORS.border },
  testBtnText: { fontSize: 14, color: COLORS.teal, fontWeight: '600' },
  providerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5, borderColor: COLORS.border + '88' },
  providerRowActive: { backgroundColor: COLORS.primaryLight + '44' },
  providerInfo: { flex: 1 },
  providerName: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '500' },
  providerModel: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  radioOuterActive: { borderColor: COLORS.primary },
  radioInner: { width: 11, height: 11, borderRadius: 6, backgroundColor: COLORS.primary },
  keyGuideRow: { paddingVertical: 10, borderBottomWidth: 0.5, borderColor: COLORS.border + '66' },
  keyGuideName: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  keyGuideUrl: { fontSize: 12, color: COLORS.primary, marginTop: 2 },
  keyGuideSteps: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
});
