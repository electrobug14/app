// src/constants.js
export const COLORS = {
  primary: '#534AB7',
  primaryLight: '#EEEDFE',
  bg: '#f5f4f0',
  card: '#fff',
  border: '#ddd',
  textPrimary: '#1a1a1a',
  textSecondary: '#333',
  textMuted: '#888',
  success: '#1D9E75',
  amber: '#ef9f27',
  amberLight: '#fff3e0',
  teal: '#0F6E56',
  tealLight: '#E1F5EE',
  coral: '#e65100',
  red: '#d32f2f'
};

export const SUBJECT_CATEGORIES = [
  'VLSI Core',
  'Embedded / C',
  'Aptitude / Soft Skills',
  'Other'
];

export const SUBJECTS = [
  { id: 'digital_design', name: 'Digital Design', category: 'VLSI Core', targetHrs: 2.5, color: '#534AB7', icon: 'hardware-chip-outline' },
  { id: 'verilog_rtl', name: 'Verilog / Verification', category: 'VLSI Core', targetHrs: 2.0, color: '#e65100', icon: 'git-network-outline' },
  { id: 'c_programming', name: 'C Programming', category: 'Embedded / C', targetHrs: 2.0, color: '#0F6E56', icon: 'terminal-outline' },
  { id: 'embedded_c', name: 'Embedded Systems', category: 'Embedded / C', targetHrs: 1.5, color: '#ef9f27', icon: 'cellular-outline' },
  { id: 'mathematics', name: 'Mathematics', category: 'Aptitude / Soft Skills', targetHrs: 1.0, color: '#d32f2f', icon: 'calculator-outline' },
  { id: 'aptitude', name: 'General Aptitude', category: 'Aptitude / Soft Skills', targetHrs: 1.0, color: '#888', icon: 'bar-chart-outline' },
  { id: 'freelancing', name: 'Freelancing', category: 'Other', targetHrs: 3.0, color: '#333', icon: 'briefcase-outline' }
];

export const DAILY_TARGET_HRS = 6.5;

export const MOOD_OPTIONS = [
  { label: 'Excellent', emoji: '🤩', color: '#1D9E75' },
  { label: 'Good', emoji: '😊', color: '#534AB7' },
  { label: 'Okay', emoji: '😐', color: '#ef9f27' },
  { label: 'Bad', emoji: '😫', color: '#e65100' }
];

export const AI_PROVIDERS = [
  { id: 'claude', name: 'Claude (Anthropic)', model: 'claude-3.5-sonnet', keyPlaceholder: 'sk-ant-...' },
  { id: 'openai', name: 'ChatGPT (OpenAI)', model: 'gpt-4o', keyPlaceholder: 'sk-...' },
  { id: 'gemini', name: 'Gemini (Google)', model: 'gemini-1.5-pro', keyPlaceholder: 'AIza...' }
];
