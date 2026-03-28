// src/screens/SubjectSelectScreen.js
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SUBJECTS, SUBJECT_CATEGORIES } from '../constants';
import { getSelectedSubjects, saveSelectedSubjects } from '../utils/storage';

export default function SubjectSelectScreen({ navigation }) {
  const [selected, setSelected] = useState([]);

  useFocusEffect(useCallback(() => {
    getSelectedSubjects().then(setSelected);
  }, []));

  function toggle(id) {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  }

  async function handleSave() {
    if (selected.length === 0) {
      Alert.alert('Select at least one subject');
      return;
    }
    await saveSelectedSubjects(selected);
    Alert.alert('Saved!', `${selected.length} subjects selected.`, [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Select Subjects</Text>
          <Text style={styles.headerSub}>{selected.length} selected</Text>
        </View>
        <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
          <Text style={styles.saveTxt}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.hint}>Select subjects you are actively studying. Sliders in Log screen will adjust automatically.</Text>

        {SUBJECT_CATEGORIES.map(category => {
          const subs = SUBJECTS.filter(s => s.category === category);
          return (
            <View key={category} style={styles.section}>
              <Text style={styles.catTitle}>{category}</Text>
              {subs.map(sub => {
                const isSelected = selected.includes(sub.id);
                return (
                  <TouchableOpacity
                    key={sub.id}
                    style={[styles.subRow, isSelected && styles.subRowSelected]}
                    onPress={() => toggle(sub.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.subIcon, { backgroundColor: sub.color + '22' }]}>
                      <Ionicons name={sub.icon} size={18} color={sub.color} />
                    </View>
                    <View style={styles.subInfo}>
                      <Text style={[styles.subName, isSelected && { color: COLORS.textPrimary, fontWeight: '600' }]}>
                        {sub.name}
                      </Text>
                      <Text style={styles.subTarget}>Daily target: {sub.targetHrs}h · {sub.category}</Text>
                    </View>
                    <View style={[styles.checkCircle, isSelected && styles.checkCircleDone]}>
                      {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.primary, paddingTop: 50, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { padding: 4 },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  headerSub: { color: '#CECBF6', fontSize: 12, marginTop: 2 },
  saveBtn: { backgroundColor: '#ffffff22', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  saveTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },
  scroll: { flex: 1 },
  hint: { margin: 16, marginBottom: 8, fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },
  section: { marginHorizontal: 16, marginBottom: 8 },
  catTitle: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginTop: 14, marginBottom: 8 },
  subRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.card, borderRadius: 12, padding: 12, marginBottom: 6, borderWidth: 0.5, borderColor: COLORS.border },
  subRowSelected: { borderColor: COLORS.primary, borderWidth: 1.5, backgroundColor: COLORS.primaryLight + '55' },
  subIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  subInfo: { flex: 1 },
  subName: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '500' },
  subTarget: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  checkCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  checkCircleDone: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
});
