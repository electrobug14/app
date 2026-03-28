// src/utils/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  LOGS: 'study_logs_v1',
  SETTINGS: 'app_settings_v1',
  SELECTED_SUBJECTS: 'selected_subjects_v1',
};

export async function getLogs() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.LOGS);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export async function saveLog(logEntry) {
  const logs = await getLogs();
  const filtered = logs.filter(l => l.date !== logEntry.date);
  filtered.push(logEntry);
  await AsyncStorage.setItem(KEYS.LOGS, JSON.stringify(filtered));
}

export async function getSettings() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : { aiProvider: 'claude', apiKey: '', userName: 'Nishit' };
  } catch { return { aiProvider: 'claude', apiKey: '', userName: 'Nishit' }; }
}

export async function saveSettings(settings) {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

export async function getSelectedSubjects() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SELECTED_SUBJECTS);
    if (raw) return JSON.parse(raw);
    return ['digital_design', 'c_programming', 'verilog_rtl', 'embedded_c', 'mathematics', 'aptitude'];
  } catch { return ['digital_design', 'c_programming', 'verilog_rtl', 'embedded_c', 'mathematics', 'aptitude']; }
}

export async function saveSelectedSubjects(subjects) {
  await AsyncStorage.setItem(KEYS.SELECTED_SUBJECTS, JSON.stringify(subjects));
}

export function todayKey() {
  return new Date().toISOString().split('T')[0];
}

export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function getWeekDates() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

export function calcStreak(logs) {
  const dates = new Set(logs.map(l => l.date));
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 90; i++) {
    const key = d.toISOString().split('T')[0];
    if (dates.has(key)) { streak++; d.setDate(d.getDate() - 1); }
    else if (i === 0) { d.setDate(d.getDate() - 1); }
    else break;
  }
  return streak;
}

export function calcTotalHours(log) {
  if (!log || !log.subjects) return 0;
  return Object.values(log.subjects).reduce((s, v) => s + (v || 0), 0);
}
