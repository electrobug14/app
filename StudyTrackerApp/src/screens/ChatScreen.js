// src/screens/ChatScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, AI_PROVIDERS } from '../constants';
import { getSettings } from '../utils/storage';
import { sendAIMessage } from '../utils/aiService';

const QUICK_PROMPTS = [
  "What should I focus on today?",
  "Give me a 1-week study challenge",
  "How to stay consistent when unmotivated?",
  "Explain UVM in simple terms",
  "What are common Verilog interview questions?",
  "Tips for C pointer mastery",
];

export default function ChatScreen({ navigation }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hey Nishit! 👋 I'm your AI study coach. Ask me anything about your VLSI/Embedded preparation, study strategies, or career path. I know your full profile and goals!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  async function sendMessage(text) {
    const msgText = text || input.trim();
    if (!msgText || loading) return;
    setInput('');
    const userMsg = { role: 'user', content: msgText };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);
    try {
      const s = settings || await getSettings();
      if (!s.apiKey) {
        setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ No API key found. Go to **Settings → AI Settings** and add your API key to start chatting!' }]);
        setLoading(false);
        return;
      }
      const history = newMessages.map(m => ({ role: m.role, content: m.content }));
      const reply = await sendAIMessage(s.aiProvider, s.apiKey, history);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ Error: ${err.message}` }]);
    }
    setLoading(false);
  }

  const providerName = AI_PROVIDERS.find(p => p.id === settings?.aiProvider)?.name || 'AI';

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.teal} />
      <View style={[styles.header, { backgroundColor: COLORS.teal }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>AI Study Coach</Text>
          <Text style={styles.headerSub}>{settings ? providerName : 'Loading...'}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.settingsBtn}>
          <Ionicons name="settings-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollRef} style={styles.msgList} showsVerticalScrollIndicator={false}>
        {/* Quick prompts */}
        {messages.length <= 1 && (
          <View style={styles.quickSection}>
            <Text style={styles.quickTitle}>Quick questions</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {QUICK_PROMPTS.map(q => (
                <TouchableOpacity key={q} style={styles.quickChip} onPress={() => sendMessage(q)}>
                  <Text style={styles.quickChipText}>{q}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {messages.map((msg, i) => (
          <View key={i} style={[styles.msgRow, msg.role === 'user' && styles.msgRowUser]}>
            {msg.role === 'assistant' && (
              <View style={styles.avatar}>
                <Ionicons name="sparkles" size={14} color={COLORS.teal} />
              </View>
            )}
            <View style={[styles.bubble, msg.role === 'user' ? styles.bubbleUser : styles.bubbleAI]}>
              <Text style={[styles.bubbleText, msg.role === 'user' && styles.bubbleTextUser]}>
                {msg.content}
              </Text>
            </View>
          </View>
        ))}

        {loading && (
          <View style={styles.msgRow}>
            <View style={styles.avatar}>
              <Ionicons name="sparkles" size={14} color={COLORS.teal} />
            </View>
            <View style={styles.bubbleAI}>
              <ActivityIndicator size="small" color={COLORS.teal} />
            </View>
          </View>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask anything about your prep..."
          placeholderTextColor={COLORS.textMuted}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: input.trim() ? COLORS.teal : COLORS.border }]}
          onPress={() => sendMessage()}
          disabled={!input.trim() || loading}
          activeOpacity={0.8}
        >
          <Ionicons name="send" size={18} color={input.trim() ? '#fff' : COLORS.textMuted} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingTop: 50, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { padding: 4 },
  settingsBtn: { padding: 4 },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  headerSub: { color: '#9FE1CB', fontSize: 12, marginTop: 2 },
  msgList: { flex: 1, paddingHorizontal: 12 },
  quickSection: { paddingVertical: 16 },
  quickTitle: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  quickChip: { backgroundColor: COLORS.card, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, borderWidth: 0.5, borderColor: COLORS.border },
  quickChipText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  msgRow: { flexDirection: 'row', marginBottom: 14, alignItems: 'flex-end', gap: 8 },
  msgRowUser: { justifyContent: 'flex-end' },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.tealLight, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  bubble: { maxWidth: '80%', borderRadius: 16, padding: 12 },
  bubbleAI: { backgroundColor: COLORS.card, borderWidth: 0.5, borderColor: COLORS.border, borderBottomLeftRadius: 4 },
  bubbleUser: { backgroundColor: COLORS.teal, borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 21 },
  bubbleTextUser: { color: '#fff' },
  inputRow: { flexDirection: 'row', gap: 10, padding: 12, backgroundColor: COLORS.card, borderTopWidth: 0.5, borderColor: COLORS.border, alignItems: 'flex-end' },
  textInput: { flex: 1, backgroundColor: COLORS.bg, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: COLORS.textPrimary, maxHeight: 100, borderWidth: 0.5, borderColor: COLORS.border },
  sendBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
});
