// src/screens/LogScreen.js
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput,
  Alert, StatusBar,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SUBJECTS, MOOD_OPTIONS, DAILY_TARGET_HRS } from '../constants';
import { getLogs, getSelectedSubjects, saveLog, todayKey, calcTotalHours } from '../utils/storage';

const CHECKLIST_ITEMS = [
  'Revised yesterday\'s notes',
  'Completed all study slots',
  'Practiced 1 coding problem',
  'Updated GitHub / portfolio',
  'Avoided random topic hopping',
  'Did revision before sleeping',
];

export default function LogScreen({ navigation }) {
  const [selectedSubs, setSelectedSubs] = useState([]);
  const [hours, setHours] = useState({});
  const [mood, setMood] = useState('');
  const [notes, setNotes] = useState('');
  const [checks, setChecks] = useState([]);
  const [existingLog, setExistingLog] = useState(null);

  useFocusEffect(useCallback(() => {
    loadData();
  }, []));

  async function loadData() {
    const subs = await getSelectedSubjects();
    setSelectedSubs(subs);
    const logs = await getLogs();
    const todayLog = logs.find(l => l.date === todayKey());
    if (todayLog) {
      setExistingLog(todayLog);
      setHours(todayLog.subjects || {});
      setMood(todayLog.mood || '');
      setNotes(todayLog.notes || '');
      setChecks(todayLog.checks || []);
    } else {
      const initHours = {};
      subs.forEach(id => { initHours[id] = 0; });
      setHours(initHours);
      setMood('');
      setNotes('');
      setChecks([]);
    }
  }

  const subjectData = SUBJECTS.filter(s => selectedSubs.includes(s.id));
  const totalHours = Object.values(hours).reduce((s, v) => s + (v || 0), 0);
  const progress = Math.min(totalHours / DAILY_TARGET_HRS, 1);

  function toggleCheck(item) {
    setChecks(prev => prev.includes(item) ? prev.filter(c => c !== item) : [...prev, item]);
  }

  async function handleSave() {
    if (totalHours === 0) {
      Alert.alert('No hours logged', 'Please log at least some study time.');
      return;
    }
    await saveLog({
      date: todayKey(),
      subjects: hours,
      mood,
      notes,
      checks,
    });
    Alert.alert('Saved!', "Today's log saved successfully.", [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log Today</Text>
        <TouchableOpacity onPress={() => navigation.navigate('SubjectSelect')} style={styles.editBtn}>
          <Ionicons name="options-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      <View style={styles.progressLabel}>
        <Text style={styles.progressText}>{totalHours.toFixed(1)} / {DAILY_TARGET_HRS} hrs today</Text>
        <Text style={[styles.progressText, { color: progress >= 1 ? COLORS.success : COLORS.textMuted }]}>
          {progress >= 1 ? '✅ Target hit!' : `${((1 - progress) * DAILY_TARGET_HRS).toFixed(1)} left`}
        </Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Subject Sliders */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Hours Studied</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SubjectSelect')}>
              <Text style={styles.editLink}>Edit subjects</Text>
            </TouchableOpacity>
          </View>

          {subjectData.length === 0 ? (
            <TouchableOpacity style={styles.addSubBtn} onPress={() => navigation.navigate('SubjectSelect')}>
              <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
              <Text style={styles.addSubText}>Select subjects to track</Text>
            </TouchableOpacity>
          ) : (
            subjectData.map(sub => (
              <View key={sub.id} style={styles.sliderRow}>
                <View style={styles.sliderTop}>
                  <View style={styles.sliderLabel}>
                    <View style={[styles.subDot, { backgroundColor: sub.color }]} />
                    <Text style={styles.subName}>{sub.name}</Text>
                  </View>
                  <View style={styles.sliderHrsBox}>
                    <Text style={[styles.sliderHrs, { color: sub.color }]}>{(hours[sub.id] || 0).toFixed(1)}h</Text>
                    <Text style={styles.sliderTarget}>/ {sub.targetHrs}h</Text>
                  </View>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={Math.max(sub.targetHrs * 2, 4)}
                  step={0.5}
                  value={hours[sub.id] || 0}
                  onValueChange={val => setHours(prev => ({ ...prev, [sub.id]: val }))}
                  minimumTrackTintColor={sub.color}
                  maximumTrackTintColor={COLORS.border}
                  thumbTintColor={sub.color}
                />
              </View>
            ))
          )}
        </View>

        {/* Mood */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Focus & Mood</Text>
          <View style={styles.moodRow}>
            {MOOD_OPTIONS.map(m => (
              <TouchableOpacity
                key={m.label}
                style={[styles.moodBtn, mood === m.label && { backgroundColor: m.color, borderColor: m.color }]}
                onPress={() => setMood(m.label)}
                activeOpacity={0.7}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text style={[styles.moodLabel, mood === m.label && { color: '#fff' }]}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Checklist */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Daily Checklist</Text>
          {CHECKLIST_ITEMS.map(item => (
            <TouchableOpacity key={item} style={styles.checkRow} onPress={() => toggleCheck(item)} activeOpacity={0.7}>
              <View style={[styles.checkBox, checks.includes(item) && styles.checkBoxDone]}>
                {checks.includes(item) && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={[styles.checkText, checks.includes(item) && styles.checkTextDone]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notes */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Notes / Blockers</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="What did you cover today? Any blockers?"
            placeholderTextColor={COLORS.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
          <Ionicons name="save-outline" size={18} color="#fff" />
          <Text style={styles.saveBtnText}>Save Today's Log</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.primary, paddingTop: 50, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { padding: 4 },
  editBtn: { padding: 4 },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  progressBar: { height: 4, backgroundColor: COLORS.primaryLight },
  progressFill: { height: 4, backgroundColor: COLORS.primary },
  progressLabel: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: COLORS.card, borderBottomWidth: 0.5, borderColor: COLORS.border },
  progressText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
  scroll: { flex: 1 },
  card: { margin: 16, marginBottom: 0, backgroundColor: COLORS.card, borderRadius: 14, padding: 16, borderWidth: 0.5, borderColor: COLORS.border, marginTop: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cardTitle: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  editLink: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  addSubBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.primaryLight, borderStyle: 'dashed', justifyContent: 'center' },
  addSubText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  sliderRow: { marginBottom: 14 },
  sliderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sliderLabel: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  subDot: { width: 8, height: 8, borderRadius: 4 },
  subName: { fontSize: 13, fontWeight: '500', color: COLORS.textPrimary, flex: 1 },
  sliderHrsBox: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  sliderHrs: { fontSize: 16, fontWeight: '700' },
  sliderTarget: { fontSize: 11, color: COLORS.textMuted },
  slider: { width: '100%', height: 36 },
  moodRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  moodBtn: { flex: 1, minWidth: '22%', alignItems: 'center', paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.bg },
  moodEmoji: { fontSize: 20, marginBottom: 4 },
  moodLabel: { fontSize: 11, fontWeight: '600', color: COLORS.textSecondary },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderBottomWidth: 0.5, borderColor: COLORS.border },
  checkBox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  checkBoxDone: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkText: { fontSize: 14, color: COLORS.textPrimary, flex: 1 },
  checkTextDone: { color: COLORS.textMuted, textDecorationLine: 'line-through' },
  notesInput: { borderWidth: 0.5, borderColor: COLORS.border, borderRadius: 10, padding: 12, fontSize: 14, color: COLORS.textPrimary, minHeight: 90, backgroundColor: '#fafafa' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, margin: 16, marginTop: 20, backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
