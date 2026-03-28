// src/screens/StudyGuideScreen.js
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { COLORS, SUBJECTS, SUBJECT_CATEGORIES } from '../constants';
import { getSettings } from '../utils/storage';
import { sendAIMessage, buildStudyGuidePrompt } from '../utils/aiService';

export default function StudyGuideScreen({ navigation }) {
  const [selectedSub, setSelectedSub] = useState(null);
  const [guide, setGuide] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('VLSI Core');

  async function loadGuide(sub) {
    setSelectedSub(sub);
    setGuide('');
    setLoading(true);
    try {
      const s = await getSettings();
      const prompt = buildStudyGuidePrompt(sub.id, sub.name);
      const reply = await sendAIMessage(s.aiProvider, s.apiKey, [{ role: 'user', content: prompt }]);
      setGuide(reply);
    } catch (err) {
      setGuide(`❌ ${err.message}\n\nMake sure your API key is set in Settings.`);
    }
    setLoading(false);
  }

  const filteredSubs = SUBJECTS.filter(s => s.category === activeCategory);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.amber} />
      <View style={[styles.header, { backgroundColor: COLORS.amber }]}>
        <TouchableOpacity onPress={() => {
          if (selectedSub) { setSelectedSub(null); setGuide(''); }
          else navigation.goBack();
        }} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{selectedSub ? selectedSub.name : 'Study Guide'}</Text>
        <View style={{ width: 30 }} />
      </View>

      {!selectedSub ? (
        <>
          {/* Category tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
            {SUBJECT_CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, activeCategory === cat && styles.catChipActive]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[styles.catChipText, activeCategory === cat && styles.catChipTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.hint}>Select a subject to get an AI-generated study guide tailored for your VLSI/Embedded career path.</Text>
            {filteredSubs.map(sub => (
              <TouchableOpacity key={sub.id} style={styles.subCard} onPress={() => loadGuide(sub)} activeOpacity={0.7}>
                <View style={[styles.subIconBox, { backgroundColor: sub.color + '20' }]}>
                  <Ionicons name={sub.icon} size={22} color={sub.color} />
                </View>
                <View style={styles.subInfo}>
                  <Text style={styles.subName}>{sub.name}</Text>
                  <Text style={styles.subCat}>{sub.category} · {sub.targetHrs}h/day target</Text>
                </View>
                <Ionicons name="sparkles-outline" size={18} color={COLORS.amber} />
              </TouchableOpacity>
            ))}
            <View style={{ height: 100 }} />
          </ScrollView>
        </>
      ) : (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Subject header */}
          <View style={[styles.subHeader, { backgroundColor: selectedSub.color + '15' }]}>
            <View style={[styles.subIconLg, { backgroundColor: selectedSub.color + '25' }]}>
              <Ionicons name={selectedSub.icon} size={32} color={selectedSub.color} />
            </View>
            <Text style={[styles.subHeaderName, { color: selectedSub.color }]}>{selectedSub.name}</Text>
            <Text style={styles.subHeaderCat}>{selectedSub.category}</Text>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={COLORS.amber} />
              <Text style={styles.loadingText}>Generating study guide...</Text>
            </View>
          ) : guide ? (
            <View style={styles.guideCard}>
              <Text style={styles.guideText}>{guide}</Text>
              <View style={styles.guideActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => Clipboard.setStringAsync(guide)}>
                  <Ionicons name="copy-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.actionBtnText}>Copy guide</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { borderColor: selectedSub.color }]} onPress={() => loadGuide(selectedSub)}>
                  <Ionicons name="refresh-outline" size={16} color={selectedSub.color} />
                  <Text style={[styles.actionBtnText, { color: selectedSub.color }]}>Regenerate</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingTop: 50, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { padding: 4 },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700', flex: 1, textAlign: 'center' },
  catScroll: { borderBottomWidth: 0.5, borderColor: COLORS.border, backgroundColor: COLORS.card, paddingVertical: 8, paddingHorizontal: 12 },
  catChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, marginRight: 8, backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border },
  catChipActive: { backgroundColor: COLORS.amberLight, borderColor: COLORS.amber },
  catChipText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '500' },
  catChipTextActive: { color: '#BA7517', fontWeight: '700' },
  scroll: { flex: 1 },
  hint: { margin: 16, fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },
  subCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, marginBottom: 8, backgroundColor: COLORS.card, borderRadius: 14, padding: 14, borderWidth: 0.5, borderColor: COLORS.border },
  subIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  subInfo: { flex: 1 },
  subName: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  subCat: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  subHeader: { margin: 16, borderRadius: 16, padding: 24, alignItems: 'center', gap: 8 },
  subIconLg: { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  subHeaderName: { fontSize: 20, fontWeight: '700' },
  subHeaderCat: { fontSize: 13, color: COLORS.textMuted },
  loadingBox: { alignItems: 'center', paddingTop: 60, gap: 16 },
  loadingText: { fontSize: 14, color: COLORS.textMuted },
  guideCard: { margin: 16, backgroundColor: COLORS.card, borderRadius: 16, padding: 18, borderWidth: 0.5, borderColor: COLORS.border },
  guideText: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 23 },
  guideActions: { flexDirection: 'row', gap: 10, marginTop: 16, paddingTop: 14, borderTopWidth: 0.5, borderColor: COLORS.border },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.primary },
  actionBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
});
