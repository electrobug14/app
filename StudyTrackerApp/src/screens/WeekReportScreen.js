// src/screens/WeekReportScreen.js
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, StatusBar, Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Clipboard } from 'react-native';
import { COLORS, SUBJECTS, DAILY_TARGET_HRS } from '../constants';
import { getLogs, getSelectedSubjects, getSettings, getWeekDates, formatDate, calcTotalHours } from '../utils/storage';
import { sendAIMessage, buildWeeklyReportPrompt, buildWeakAreaTipsPrompt } from '../utils/aiService';

export default function WeekReportScreen({ navigation }) {
  const [weekLogs, setWeekLogs] = useState([]);
  const [weekDates, setWeekDates] = useState([]);
  const [subjectTotals, setSubjectTotals] = useState({});
  const [selectedSubs, setSelectedSubs] = useState([]);
  const [aiPlan, setAiPlan] = useState('');
  const [aiTips, setAiTips] = useState('');
  const [loading, setLoading] = useState(false);
  const [tipsLoading, setTipsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('stats');

  useFocusEffect(useCallback(() => { loadData(); }, []));

  async function loadData() {
    const logs = await getLogs();
    const subs = await getSelectedSubjects();
    const dates = getWeekDates();
    setWeekDates(dates);
    setSelectedSubs(subs);
    const wLogs = dates.map(d => logs.find(l => l.date === d)).filter(Boolean);
    setWeekLogs(wLogs);
    const totals = {};
    wLogs.forEach(log => {
      if (log.subjects) {
        Object.entries(log.subjects).forEach(([id, hrs]) => {
          totals[id] = (totals[id] || 0) + (hrs || 0);
        });
      }
    });
    setSubjectTotals(totals);
  }

  async function getAIPlan() {
    setLoading(true);
    setActiveTab('plan');
    try {
      const s = await getSettings();
      const prompt = buildWeeklyReportPrompt(weekLogs, selectedSubs, SUBJECTS);
      const reply = await sendAIMessage(s.aiProvider, s.apiKey, [{ role: 'user', content: prompt }]);
      setAiPlan(reply);
    } catch (err) {
      setAiPlan(`❌ ${err.message}`);
    }
    setLoading(false);
  }

  async function getWeakAreaTips() {
    setTipsLoading(true);
    setActiveTab('tips');
    try {
      const s = await getSettings();
      const subData = SUBJECTS.filter(sub => selectedSubs.includes(sub.id));
      const weakSubs = subData
        .filter(sub => {
          const actual = subjectTotals[sub.id] || 0;
          const target = sub.targetHrs * weekLogs.length;
          return target > 0 && actual / target < 0.5;
        })
        .map(s => s.name);
      if (weakSubs.length === 0) {
        setAiTips("Great job! No significantly weak subjects this week. Keep maintaining consistency across all subjects.");
        setTipsLoading(false);
        return;
      }
      const prompt = buildWeakAreaTipsPrompt(weakSubs);
      const reply = await sendAIMessage(s.aiProvider, s.apiKey, [{ role: 'user', content: prompt }]);
      setAiTips(reply);
    } catch (err) {
      setAiTips(`❌ ${err.message}`);
    }
    setTipsLoading(false);
  }

  const totalHrs = Object.values(subjectTotals).reduce((s, v) => s + v, 0);
  const daysLogged = weekLogs.length;
  const avgHrs = daysLogged ? (totalHrs / daysLogged).toFixed(1) : 0;
  const weekTarget = DAILY_TARGET_HRS * 7;

  const subjectRows = SUBJECTS.filter(s => subjectTotals[s.id] > 0 || selectedSubs.includes(s.id));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.coral} />
      <View style={[styles.header, { backgroundColor: COLORS.coral }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Week Report</Text>
        <TouchableOpacity onPress={async () => {
          const text = `My week: ${daysLogged}/7 days, ${totalHrs.toFixed(1)} hrs total`;
          await Share.share({ message: text });
        }}>
          <Ionicons name="share-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {['stats', 'plan', 'tips'].map(t => (
          <TouchableOpacity key={t} style={[styles.tab, activeTab === t && styles.tabActive]} onPress={() => setActiveTab(t)}>
            <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
              {t === 'stats' ? 'Stats' : t === 'plan' ? 'AI Next Plan' : 'Weak Area Tips'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {activeTab === 'stats' && (
          <>
            {/* Summary metrics */}
            <View style={styles.metricsGrid}>
              {[
                { val: totalHrs.toFixed(1), lbl: 'Total hrs', icon: 'time-outline', color: COLORS.coral },
                { val: `${daysLogged}/7`, lbl: 'Days logged', icon: 'calendar-outline', color: COLORS.primary },
                { val: avgHrs, lbl: 'Avg hrs/day', icon: 'trending-up-outline', color: COLORS.teal },
                { val: `${Math.round((totalHrs / weekTarget) * 100)}%`, lbl: 'Week target', icon: 'checkmark-circle-outline', color: COLORS.amber },
              ].map(m => (
                <View key={m.lbl} style={styles.metricCard}>
                  <Ionicons name={m.icon} size={18} color={m.color} />
                  <Text style={[styles.metricVal, { color: m.color }]}>{m.val}</Text>
                  <Text style={styles.metricLbl}>{m.lbl}</Text>
                </View>
              ))}
            </View>

            {/* Subject breakdown */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Subject Breakdown</Text>
              {subjectRows.map(sub => {
                const actual = subjectTotals[sub.id] || 0;
                const target = sub.targetHrs * (daysLogged || 1);
                const pct = Math.min(actual / Math.max(target, 0.1), 1);
                const status = pct >= 0.8 ? 'good' : pct >= 0.4 ? 'ok' : 'low';
                return (
                  <View key={sub.id} style={styles.subRow}>
                    <View style={styles.subLeft}>
                      <View style={[styles.subDot, { backgroundColor: sub.color }]} />
                      <Text style={styles.subName}>{sub.name}</Text>
                    </View>
                    <View style={styles.subRight}>
                      <Text style={[styles.subHrs, { color: sub.color }]}>{actual.toFixed(1)}h</Text>
                      <View style={styles.miniBar}>
                        <View style={[styles.miniBarFill, { width: `${pct * 100}%`, backgroundColor: status === 'good' ? COLORS.success : status === 'ok' ? COLORS.amber : COLORS.red }]} />
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* AI buttons */}
            <TouchableOpacity style={[styles.aiBtn, { backgroundColor: COLORS.coral }]} onPress={getAIPlan} activeOpacity={0.85}>
              <Ionicons name="sparkles-outline" size={18} color="#fff" />
              <Text style={styles.aiBtnText}>Get AI Next Week Plan</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.aiBtn, { backgroundColor: COLORS.primary }]} onPress={getWeakAreaTips} activeOpacity={0.85}>
              <Ionicons name="bulb-outline" size={18} color="#fff" />
              <Text style={styles.aiBtnText}>Get Weak Area Tips</Text>
            </TouchableOpacity>
          </>
        )}

        {activeTab === 'plan' && (
          <View style={styles.aiContent}>
            {!aiPlan && !loading && (
              <TouchableOpacity style={[styles.aiBtn, { backgroundColor: COLORS.coral }]} onPress={getAIPlan}>
                <Ionicons name="sparkles-outline" size={18} color="#fff" />
                <Text style={styles.aiBtnText}>Generate Next Week Plan</Text>
              </TouchableOpacity>
            )}
            {loading && <ActivityIndicator size="large" color={COLORS.coral} style={{ marginTop: 40 }} />}
            {aiPlan ? (
              <View style={styles.aiTextCard}>
                <Text style={styles.aiText}>{aiPlan}</Text>
                <TouchableOpacity style={styles.copyBtn} onPress={() => Clipboard.setString(aiPlan)}>
                  <Ionicons name="copy-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.copyBtnText}>Copy</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        )}

        {activeTab === 'tips' && (
          <View style={styles.aiContent}>
            {!aiTips && !tipsLoading && (
              <TouchableOpacity style={[styles.aiBtn, { backgroundColor: COLORS.primary }]} onPress={getWeakAreaTips}>
                <Ionicons name="bulb-outline" size={18} color="#fff" />
                <Text style={styles.aiBtnText}>Analyze Weak Areas</Text>
              </TouchableOpacity>
            )}
            {tipsLoading && <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />}
            {aiTips ? (
              <View style={styles.aiTextCard}>
                <Text style={styles.aiText}>{aiTips}</Text>
                <TouchableOpacity style={styles.copyBtn} onPress={() => Clipboard.setString(aiTips)}>
                  <Ionicons name="copy-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.copyBtnText}>Copy</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingTop: 50, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { padding: 4 },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  tabs: { flexDirection: 'row', backgroundColor: COLORS.card, borderBottomWidth: 0.5, borderColor: COLORS.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: COLORS.coral },
  tabText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '500' },
  tabTextActive: { color: COLORS.coral, fontWeight: '700' },
  scroll: { flex: 1 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 16 },
  metricCard: { width: '47%', backgroundColor: COLORS.card, borderRadius: 12, padding: 14, alignItems: 'center', gap: 6, borderWidth: 0.5, borderColor: COLORS.border },
  metricVal: { fontSize: 24, fontWeight: '700' },
  metricLbl: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center' },
  card: { marginHorizontal: 16, marginBottom: 12, backgroundColor: COLORS.card, borderRadius: 14, padding: 16, borderWidth: 0.5, borderColor: COLORS.border },
  cardTitle: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 },
  subRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 0.5, borderColor: COLORS.border + '88' },
  subLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  subDot: { width: 8, height: 8, borderRadius: 4 },
  subName: { fontSize: 13, color: COLORS.textPrimary, flex: 1 },
  subRight: { alignItems: 'flex-end', gap: 4 },
  subHrs: { fontSize: 14, fontWeight: '700' },
  miniBar: { width: 60, height: 4, backgroundColor: COLORS.border, borderRadius: 2, overflow: 'hidden' },
  miniBarFill: { height: 4 },
  aiBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, margin: 16, marginBottom: 10, borderRadius: 14, paddingVertical: 14 },
  aiBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  aiContent: { padding: 16 },
  aiTextCard: { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, borderWidth: 0.5, borderColor: COLORS.border },
  aiText: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 22 },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, paddingTop: 12, borderTopWidth: 0.5, borderColor: COLORS.border },
  copyBtnText: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
});
