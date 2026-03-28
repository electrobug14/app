// src/screens/HomeScreen.js
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SUBJECTS, DAILY_TARGET_HRS, MOOD_OPTIONS } from '../constants';
import { getLogs, getSelectedSubjects, todayKey, formatDate, getWeekDates, calcStreak, calcTotalHours } from '../utils/storage';

export default function HomeScreen({ navigation }) {
  const [todayLog, setTodayLog] = useState(null);
  const [streak, setStreak] = useState(0);
  const [weekData, setWeekData] = useState([]);
  const [selectedSubs, setSelectedSubs] = useState([]);
  const [allLogs, setAllLogs] = useState([]);

  useFocusEffect(useCallback(() => {
    loadData();
  }, []));

  async function loadData() {
    const logs = await getLogs();
    const subs = await getSelectedSubjects();
    setAllLogs(logs);
    setSelectedSubs(subs);
    setStreak(calcStreak(logs));
    const today = todayKey();
    setTodayLog(logs.find(l => l.date === today) || null);
    const weekDates = getWeekDates();
    setWeekData(weekDates.map(d => ({ date: d, log: logs.find(l => l.date === d) })));
  }

  const todayHours = todayLog ? calcTotalHours(todayLog) : 0;
  const progress = Math.min(todayHours / DAILY_TARGET_HRS, 1);

  const weekTotal = weekData.reduce((s, d) => s + calcTotalHours(d.log), 0);
  const weekDays = weekData.filter(d => d.log).length;

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>Hey Nishit 👋</Text>
          <Text style={styles.headerDate}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
        </View>
        <View style={styles.streakBadge}>
          <Text style={styles.streakText}>🔥 {streak}</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Today Progress Card */}
        <TouchableOpacity style={styles.todayCard} onPress={() => navigation.navigate('Log')} activeOpacity={0.9}>
          <View style={styles.todayCardTop}>
            <Text style={styles.todayLabel}>Today's Progress</Text>
            <Text style={styles.todayHours}>{todayHours.toFixed(1)} / {DAILY_TARGET_HRS} hrs</Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <View style={styles.todayCardBottom}>
            <Text style={styles.todayStatus}>
              {!todayLog ? "Tap to log today's study" : progress >= 1 ? '✅ Target achieved!' : `${((1 - progress) * DAILY_TARGET_HRS).toFixed(1)} hrs left`}
            </Text>
            {todayLog?.mood && (
              <Text style={styles.moodTag}>
                {MOOD_OPTIONS.find(m => m.label === todayLog.mood)?.emoji} {todayLog.mood}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        {/* Week Dots */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>This Week</Text>
          <View style={styles.weekRow}>
            {weekData.map(({ date, log }, i) => {
              const total = calcTotalHours(log);
              const isToday = date === todayKey();
              const status = !log ? 'miss' : total >= DAILY_TARGET_HRS ? 'done' : 'partial';
              return (
                <View key={date} style={styles.dayCol}>
                  <View style={[
                    styles.dayDot,
                    status === 'done' && styles.dotDone,
                    status === 'partial' && styles.dotPartial,
                    isToday && styles.dotToday,
                  ]}>
                    <Text style={[styles.dotText, status !== 'miss' && { color: '#fff' }]}>
                      {total > 0 ? total.toFixed(0) : ''}
                    </Text>
                  </View>
                  <Text style={styles.dayName}>{days[i]}</Text>
                </View>
              );
            })}
          </View>
          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <Text style={styles.metricVal}>{weekTotal.toFixed(1)}</Text>
              <Text style={styles.metricLbl}>Total hrs</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricVal}>{weekDays}</Text>
              <Text style={styles.metricLbl}>Days</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricVal}>{weekDays ? (weekTotal / weekDays).toFixed(1) : '0'}</Text>
              <Text style={styles.metricLbl}>Avg/day</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricVal}>{streak}</Text>
              <Text style={styles.metricLbl}>Streak</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {[
            { icon: 'create-outline', label: 'Log Today', screen: 'Log', color: COLORS.primary },
            { icon: 'chatbubble-ellipses-outline', label: 'Ask AI', screen: 'Chat', color: COLORS.teal },
            { icon: 'book-outline', label: 'Study Guide', screen: 'StudyGuide', color: COLORS.amber },
            { icon: 'bar-chart-outline', label: 'Week Report', screen: 'WeekReport', color: COLORS.coral },
          ].map(action => (
            <TouchableOpacity
              key={action.label}
              style={[styles.actionBtn, { borderColor: action.color + '44' }]}
              onPress={() => navigation.navigate(action.screen)}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.color + '18' }]}>
                <Ionicons name={action.icon} size={22} color={action.color} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Logs */}
        <Text style={styles.sectionTitle}>Recent Logs</Text>
        {allLogs.slice(-3).reverse().map(log => (
          <View key={log.date} style={styles.logItem}>
            <View style={styles.logLeft}>
              <Text style={styles.logDate}>{formatDate(log.date)}</Text>
              {log.notes ? <Text style={styles.logNote} numberOfLines={1}>{log.notes}</Text> : null}
            </View>
            <View style={styles.logRight}>
              <Text style={styles.logHrs}>{calcTotalHours(log).toFixed(1)}h</Text>
              {log.mood && <Text style={styles.logMood}>{MOOD_OPTIONS.find(m => m.label === log.mood)?.emoji}</Text>}
            </View>
          </View>
        ))}
        {allLogs.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="journal-outline" size={40} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No logs yet. Start today!</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.primary, padding: 20, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerGreeting: { color: '#fff', fontSize: 20, fontWeight: '700' },
  headerDate: { color: '#CECBF6', fontSize: 13, marginTop: 2 },
  streakBadge: { backgroundColor: '#ffffff22', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  streakText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  scroll: { flex: 1 },
  todayCard: { margin: 16, backgroundColor: COLORS.primary, borderRadius: 16, padding: 18 },
  todayCardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  todayLabel: { color: '#CECBF6', fontSize: 13, fontWeight: '600' },
  todayHours: { color: '#fff', fontSize: 14, fontWeight: '700' },
  progressBg: { height: 8, backgroundColor: '#ffffff33', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, backgroundColor: '#fff', borderRadius: 4 },
  todayCardBottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  todayStatus: { color: '#CECBF6', fontSize: 13 },
  moodTag: { color: '#fff', fontSize: 13 },
  card: { marginHorizontal: 16, marginBottom: 12, backgroundColor: COLORS.card, borderRadius: 14, padding: 16, borderWidth: 0.5, borderColor: COLORS.border },
  cardTitle: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  dayCol: { alignItems: 'center', gap: 4 },
  dayDot: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#f0f0ee', alignItems: 'center', justifyContent: 'center' },
  dotDone: { backgroundColor: COLORS.primary },
  dotPartial: { backgroundColor: COLORS.primaryLight, borderWidth: 1.5, borderColor: COLORS.primary },
  dotToday: { borderWidth: 2, borderColor: COLORS.primary },
  dotText: { fontSize: 10, fontWeight: '700', color: COLORS.textMuted },
  dayName: { fontSize: 10, color: COLORS.textMuted },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  metric: { alignItems: 'center' },
  metricVal: { fontSize: 20, fontWeight: '700', color: COLORS.primary },
  metricLbl: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginHorizontal: 16, marginBottom: 10, marginTop: 4 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 12, gap: 10, marginBottom: 16 },
  actionBtn: { width: '47%', backgroundColor: COLORS.card, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1 },
  actionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  logItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, marginBottom: 8, backgroundColor: COLORS.card, borderRadius: 10, padding: 12, borderWidth: 0.5, borderColor: COLORS.border },
  logLeft: { flex: 1 },
  logDate: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  logNote: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  logRight: { alignItems: 'flex-end', gap: 4 },
  logHrs: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  logMood: { fontSize: 16 },
  emptyState: { alignItems: 'center', padding: 30, gap: 12 },
  emptyText: { color: COLORS.textMuted, fontSize: 14 },
});
