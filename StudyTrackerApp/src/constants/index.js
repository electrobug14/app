// src/constants/index.js

export const COLORS = {
  primary: '#534AB7',
  primaryLight: '#EEEDFE',
  primaryDark: '#26215C',
  primaryMid: '#3C3489',
  teal: '#1D9E75',
  tealLight: '#E1F5EE',
  amber: '#EF9F27',
  amberLight: '#FAEEDA',
  coral: '#D85A30',
  coralLight: '#FAECE7',
  red: '#E24B4A',
  redLight: '#FCEBEB',
  bg: '#F5F4F0',
  card: '#FFFFFF',
  border: '#E5E5E5',
  textPrimary: '#1A1A1A',
  textSecondary: '#666666',
  textMuted: '#AAAAAA',
  success: '#1D9E75',
  warning: '#EF9F27',
};

export const SUBJECTS = [
  // Core VLSI
  { id: 'digital_design', name: 'Digital Design', category: 'VLSI Core', color: '#534AB7', icon: 'hardware-chip-outline', targetHrs: 2.5 },
  { id: 'verilog_rtl', name: 'Verilog / RTL', category: 'VLSI Core', color: '#3C3489', icon: 'code-slash-outline', targetHrs: 2.0 },
  { id: 'sv_uvm', name: 'SystemVerilog + UVM', category: 'VLSI Core', color: '#7F77DD', icon: 'checkmark-circle-outline', targetHrs: 2.0 },
  { id: 'physical_design', name: 'Physical Design', category: 'VLSI Core', color: '#AFA9EC', icon: 'layers-outline', targetHrs: 1.5 },
  { id: 'fpga_design', name: 'FPGA Design', category: 'VLSI Core', color: '#534AB7', icon: 'grid-outline', targetHrs: 2.0 },
  { id: 'sta', name: 'Static Timing Analysis', category: 'VLSI Core', color: '#3C3489', icon: 'time-outline', targetHrs: 1.5 },
  { id: 'dft', name: 'DFT / Scan Design', category: 'VLSI Core', color: '#7F77DD', icon: 'bug-outline', targetHrs: 1.5 },

  // Embedded
  { id: 'embedded_c', name: 'Embedded C / Firmware', category: 'Embedded', color: '#1D9E75', icon: 'terminal-outline', targetHrs: 2.0 },
  { id: 'freertos', name: 'FreeRTOS / RTOS', category: 'Embedded', color: '#0F6E56', icon: 'swap-horizontal-outline', targetHrs: 1.5 },
  { id: 'linux_drivers', name: 'Linux & Device Drivers', category: 'Embedded', color: '#085041', icon: 'logo-tux', targetHrs: 1.5 },
  { id: 'arm_arch', name: 'ARM Architecture', category: 'Embedded', color: '#1D9E75', icon: 'cpu-outline', targetHrs: 1.5 },
  { id: 'protocols', name: 'Protocols (UART/SPI/I2C/CAN)', category: 'Embedded', color: '#0F6E56', icon: 'git-branch-outline', targetHrs: 1.5 },

  // Core ECE
  { id: 'c_programming', name: 'C Programming', category: 'Core ECE', color: '#EF9F27', icon: 'logo-c', targetHrs: 2.0 },
  { id: 'cpp', name: 'C++ / OOP', category: 'Core ECE', color: '#BA7517', icon: 'extension-puzzle-outline', targetHrs: 1.5 },
  { id: 'python_gui', name: 'Python / GUI', category: 'Core ECE', color: '#EF9F27', icon: 'logo-python', targetHrs: 1.0 },
  { id: 'signals_systems', name: 'Signals & Systems', category: 'Core ECE', color: '#D85A30', icon: 'pulse-outline', targetHrs: 1.5 },
  { id: 'analog_electronics', name: 'Analog Electronics', category: 'Core ECE', color: '#993C1D', icon: 'radio-outline', targetHrs: 1.5 },
  { id: 'electronic_devices', name: 'Electronic Devices', category: 'Core ECE', color: '#D85A30', icon: 'flash-outline', targetHrs: 1.5 },
  { id: 'microprocessors', name: 'Microprocessors / 8085', category: 'Core ECE', color: '#BA7517', icon: 'server-outline', targetHrs: 1.5 },
  { id: 'computer_arch', name: 'Computer Architecture', category: 'Core ECE', color: '#EF9F27', icon: 'desktop-outline', targetHrs: 1.5 },
  { id: 'vlsi_circuits', name: 'VLSI Circuits & Design', category: 'Core ECE', color: '#D85A30', icon: 'share-social-outline', targetHrs: 1.5 },

  // Non-negotiable
  { id: 'mathematics', name: 'Engineering Mathematics', category: 'Non-negotiable', color: '#E24B4A', icon: 'calculator-outline', targetHrs: 1.5 },
  { id: 'aptitude', name: 'Aptitude & Reasoning', category: 'Non-negotiable', color: '#A32D2D', icon: 'bulb-outline', targetHrs: 1.0 },
  { id: 'verbal', name: 'Verbal / Communication', category: 'Non-negotiable', color: '#E24B4A', icon: 'chatbubble-outline', targetHrs: 0.5 },
  { id: 'dsa', name: 'Data Structures & Algorithms', category: 'Non-negotiable', color: '#791F1F', icon: 'git-merge-outline', targetHrs: 1.5 },

  // Career
  { id: 'freelancing', name: 'Freelancing / Projects', category: 'Career', color: '#888780', icon: 'briefcase-outline', targetHrs: 1.0 },
  { id: 'interview_prep', name: 'Interview Preparation', category: 'Career', color: '#5F5E5A', icon: 'people-outline', targetHrs: 1.0 },
  { id: 'github_portfolio', name: 'GitHub / Portfolio', category: 'Career', color: '#444441', icon: 'logo-github', targetHrs: 0.5 },
];

export const SUBJECT_CATEGORIES = ['VLSI Core', 'Embedded', 'Core ECE', 'Non-negotiable', 'Career'];

export const AI_PROVIDERS = [
  { id: 'claude', name: 'Claude (Anthropic)', model: 'claude-sonnet-4-20250514', baseUrl: 'https://api.anthropic.com/v1/messages', keyPlaceholder: 'sk-ant-...' },
  { id: 'gemini', name: 'Gemini (Google)', model: 'gemini-1.5-flash', baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models', keyPlaceholder: 'AIza...' },
  { id: 'openai', name: 'ChatGPT (OpenAI)', model: 'gpt-4o-mini', baseUrl: 'https://api.openai.com/v1/chat/completions', keyPlaceholder: 'sk-...' },
];

export const MOOD_OPTIONS = [
  { label: 'Excellent', emoji: '🔥', color: '#1D9E75' },
  { label: 'Good', emoji: '😊', color: '#534AB7' },
  { label: 'Okay', emoji: '😐', color: '#EF9F27' },
  { label: 'Bad', emoji: '😔', color: '#E24B4A' },
];

export const DAILY_TARGET_HRS = 6.5;
