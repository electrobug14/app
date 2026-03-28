// src/utils/aiService.js

const SYSTEM_PROMPT = `You are a strict but supportive career coach and study mentor for Nishit Bayen, a 22-year-old ECE graduate from MAKAUT (graduated 2025) preparing for VLSI Verification Engineer and Embedded Software Engineer roles in India. 

His background:
- Has done projects: UART in Verilog, ASIC flow with OpenLane/SKY130, FPGA on Artix-7, Logic Analyzer, IoT systems, CNN on FPGA
- Published IEEE paper
- FOSSEE contributor (open-source EDA)
- Currently unemployed, target: job by December 2026
- Primary target: VLSI Verification Engineer
- Secondary target: Embedded Software Engineer

His study plan phases:
Phase 1 (now–2 months): Foundation rebuild - Digital Design, C, Verilog basics
Phase 2 (2–5 months): Industry skills - SystemVerilog, UVM basics, FreeRTOS, AXI-lite
Phase 3 (5–9 months): Job prep - portfolio, interview prep, apply

Keep responses concise, practical, and motivating. Use bullet points where helpful. Always reference his specific goals and timeline.`;

async function callClaude(apiKey, messages) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Claude API error');
  return data.content?.[0]?.text || '';
}

async function callOpenAI(apiKey, messages) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 1000,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'OpenAI API error');
  return data.choices?.[0]?.message?.content || '';
}

async function callGemini(apiKey, messages) {
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
      generationConfig: { maxOutputTokens: 1000 },
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Gemini API error');
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

export async function sendAIMessage(provider, apiKey, messages) {
  if (!apiKey) throw new Error('No API key set. Go to Settings and add your API key.');
  switch (provider) {
    case 'claude': return callClaude(apiKey, messages);
    case 'openai': return callOpenAI(apiKey, messages);
    case 'gemini': return callGemini(apiKey, messages);
    default: throw new Error('Unknown provider');
  }
}

export function buildWeeklyReportPrompt(weekLogs, selectedSubjects, allSubjects) {
  const subjectMap = Object.fromEntries(allSubjects.map(s => [s.id, s.name]));
  const days = weekLogs.length;
  const subjectTotals = {};
  weekLogs.forEach(log => {
    if (log.subjects) {
      Object.entries(log.subjects).forEach(([id, hrs]) => {
        subjectTotals[id] = (subjectTotals[id] || 0) + (hrs || 0);
      });
    }
  });
  const totalHrs = Object.values(subjectTotals).reduce((s, v) => s + v, 0);
  const moodList = weekLogs.map(l => l.mood).filter(Boolean);
  const notes = weekLogs.map(l => l.notes).filter(Boolean).join('; ');

  const subjectLines = Object.entries(subjectTotals)
    .map(([id, hrs]) => `  - ${subjectMap[id] || id}: ${hrs.toFixed(1)} hrs`)
    .join('\n');

  return `Analyze my study log for this week and give me a tailored next week plan:

Days logged: ${days}/7
Total hours: ${totalHrs.toFixed(1)}
Subject breakdown:
${subjectLines}
Mood pattern: ${moodList.join(', ') || 'not logged'}
My notes: ${notes || 'none'}

Based on this, tell me:
1. What I did well
2. My weak areas this week
3. Specific adjusted plan for next week (which subjects to focus more/less)
4. One motivational insight`;
}

export function buildStudyGuidePrompt(subjectId, subjectName) {
  return `Give me a concise, beginner-to-intermediate study guide for "${subjectName}" specifically for a fresher targeting VLSI Verification and Embedded roles in India. Include:
1. Why this subject matters for my target roles
2. Key topics to cover (ordered by priority)
3. Best free resources (YouTube channels, websites, books)
4. Practical exercises I can do
5. Common interview questions from this subject
Keep it actionable and specific to my profile.`;
}

export function buildWeakAreaTipsPrompt(weakSubjects) {
  return `Based on my study logs, I have been consistently weak in: ${weakSubjects.join(', ')}. 
Give me 3 specific, practical tips for each subject to improve. Focus on techniques that work for self-study without formal training. Keep tips very actionable.`;
}
