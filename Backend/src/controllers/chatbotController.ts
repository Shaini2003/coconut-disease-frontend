// Backend/src/controllers/chatbotController.ts

import { Response } from 'express';
import axios from 'axios';
import pool from '../config/db';

// ── API Keys ────────────────────────────────────────────────────────────────
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const OPENAI_API_KEY    = process.env.OPENAI_API_KEY    || '';

// ── System Prompts (Enhanced with Context & Full Knowledge) ─────────────────
const SYSTEM_PROMPT_EN = `You are CocoAI Assistant, an expert agricultural AI specializing in coconut farming and diseases in Sri Lanka. 

IMPORTANT RULES:
1. ONLY answer questions about coconut farming, coconut diseases, agricultural practices, and fertilizers. Politely decline unrelated questions.
2. Always respond in ENGLISH.
3. Keep responses concise, practical, and helpful.
4. If a user asks about a disease or uploads an image without giving details, politely ask: "Are you observing this issue only on the leaves, or is there a problem on the trunk as well?" to guide them accurately.
5. For critical diseases (Bud Rot, Stem Bleeding, WCLWD), ALWAYS recommend contacting CRISL (Coconut Research Institute of Sri Lanka).

DISEASE KNOWLEDGE:
- Bud Rot (Critical): Caused by Phytophthora palmivora. Apply Copper Oxychloride (3g/L). Remove infected tissue.
- Stem Bleeding (Critical): Caused by Thielaviopsis paradoxa. Chisel out infected tissue, apply Bordeaux paste.
- WCLWD (Critical): Phytoplasma disease. No cure. Control leafhopper vectors. Contact CRISL immediately.
- Gray Leaf Spot (Medium): Caused by Pestalotiopsis palmarum. Apply Mancozeb fungicide (2g/L).
- Leaf Rot (High): Remove infected fronds. Apply Bordeaux mixture.
- Bud Root Dropping (High): Improve drainage. Apply Metalaxyl fungicide.
- CCI Caterpillars (Medium): Apply Bt (Bacillus thuringiensis) spray. Introduce parasitic wasps.
- CCI Leaflets (Medium): Apply neem oil spray (5ml/L). Use systemic insecticide.

FERTILIZER GUIDANCE:
- General: NPK 14-14-14 at 500g per tree every 3 months
- For disease recovery: Add Magnesium sulfate and micronutrients
- CRISL contact: +94 37 228 5000 | www.cocoaboard.lk`;

const SYSTEM_PROMPT_SI = `ඔබ CocoAI සහායකයා — ශ්‍රී ලංකාවේ පොල් ගොවිතැන සහ රෝග පිළිබඳ විශේෂඥ AI කෘෂිකාර්මික සහායකයා.

වැදගත් නීති:
1. පොල් ගොවිතැන, පොල් රෝග, කෘෂිකාර්මික ක්‍රම සහ පොහොර ගැන පමණක් පිළිතුරු දෙන්න. වෙනත් ප්‍රශ්න කාරුණිකව ප්‍රතික්ෂේප කරන්න.
2. සෑම විටම සිංහල භාෂාවෙන් පිළිතුරු දෙන්න.
3. පරිශීලකයා රෝගයක් ගැන විමසූ විට, "මෙම ගැටලුව පත්‍රවල පමණක් තිබේද නැතිනම් කඳේද තිබේද?" කියා අසා තීරණය ලබා දෙන්න.
4. පිළිතුරු කෙටි සහ ප්‍රායෝගික කරන්න.
5. අනතුරුදායක රෝග (බද් රොට්, ස්ටෙම් ලේ වැගිරීම, WCLWD) සඳහා CRISL ආයතනය සම්බන්ධ කරගන්නා ලෙස සෑම විටම නිර්දේශ කරන්න.

රෝග දැනුම:
- බද් රොට් (අනතුරුදායක): Phytophthora palmivora නිසා. Copper Oxychloride (3g/L) ඉසිනු.
- ස්ටෙම් ලේ වැගිරීම (අනතුරුදායක): Thielaviopsis paradoxa නිසා. ආසාදිත ස්ථාන කපා Bordeaux paste ගාන්න.
- WCLWD (අනතුරුදායක): ෆයිටොප්ලාස්මා රෝගය. ප්‍රතිකාරයක් නැත. CRISL ට වහාම දැනුම් දෙන්න.
- ග්‍රේ ලීෆ් ස්පොට් (මධ්‍යම): Mancozeb (2g/L) ඉසිනු.
- කොළ කුණු රෝගය (ඉහළ): ආසාදිත ශාඛා ඉවත් කර Bordeaux mixture ඉසිනු.
- බද් රූට් ඩ්‍රොපිං (ඉහළ): ජලාපවාහනය වැඩිදියුණු කර Metalaxyl ඉසිනු.
- CCI රූකඩ (මධ්‍යම): Bt ඉසිනු.
- CCI ලීෆ්ලෙට්ස් (මධ්‍යම): නීම් තෙල් (5ml/L) ඉසිනු.

පොහොර මාර්ගෝපදේශය:
- සාමාන්‍ය: NPK 14-14-14 ගස් 500g බැගින් මාස 3 කට වරක්.
- CRISL දුරකතන: +94 37 228 5000 | www.cocoaboard.lk`;

// ── POST /api/chatbot ─────────────────────────────────────────────────────────
export const chat = async (req: any, res: Response) => {
  const { message, language = 'en', history = [] } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ message: 'Message is required.' });
  }

  const systemPrompt = language === 'si' ? SYSTEM_PROMPT_SI : SYSTEM_PROMPT_EN;
  let botResponse    = '';

  // Format history for context awareness
  const formattedHistory = history.map((msg: any) => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.text
  }));

  // ── Try Anthropic Claude API ───────────────────────────────────────────────
  if (ANTHROPIC_API_KEY) {
    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model:      'claude-haiku-4-5-20251001',
          max_tokens: 800,
          system:     systemPrompt,
          messages:   [
            ...formattedHistory, 
            { role: 'user', content: message }
          ],
        },
        {
          headers: {
            'x-api-key':         ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'content-type':      'application/json',
          },
          timeout: 30000,
        }
      );
      botResponse = response.data?.content?.[0]?.text || '';
    } catch (err: any) {
      console.error('Anthropic API error:', err.message);
    }
  }

  // ── Try OpenAI API ─────────────────────────────────────────────────────────
  if (!botResponse && OPENAI_API_KEY) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model:      'gpt-3.5-turbo',
          max_tokens: 800,
          messages:   [
            { role: 'system', content: systemPrompt },
            ...formattedHistory,
            { role: 'user',   content: message },
          ],
        },
        {
          headers: {
            Authorization:  `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );
      botResponse = response.data?.choices?.[0]?.message?.content || '';
    } catch (err: any) {
      console.error('OpenAI API error:', err.message);
    }
  }

  // ── Fallback: Rule-based responses ─────────────────────────────────────────
  if (!botResponse) {
    botResponse = getRuleBasedResponse(message, language);
  }

  // ── Save to DB ─────────────────────────────────────────────────────────────
  try {
    await pool.query(
      `INSERT INTO chatbot_logs (user_id, user_message, bot_response, language)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE user_message = user_message`,
      [req.userId, message, botResponse, language]
    );
  } catch (dbErr: any) {
    // Try without language column (old schema)
    try {
      await pool.query(
        `INSERT INTO chatbot_logs (user_id, user_message, bot_response) VALUES (?, ?, ?)`,
        [req.userId, message, botResponse]
      );
    } catch (dbErr2: any) {
      console.warn('Chat history save failed:', dbErr2.message);
    }
  }

  return res.json({ message: botResponse });
};

// ── GET /api/chatbot/history ──────────────────────────────────────────────────
export const getChatHistory = async (req: any, res: Response) => {
  try {
    const [rows]: any = await pool.query(
      `SELECT user_message, bot_response, created_at
       FROM chatbot_logs
       WHERE user_id = ?
       ORDER BY created_at ASC
       LIMIT 50`,
      [req.userId]
    );
    return res.json({ history: rows });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to fetch history.' });
  }
};

// ── DELETE /api/chatbot/history ───────────────────────────────────────────────
export const clearHistory = async (req: any, res: Response) => {
  try {
    await pool.query('DELETE FROM chatbot_logs WHERE user_id = ?', [req.userId]);
    return res.json({ message: 'History cleared.' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to delete history.' });
  }
};

// ── Rule-based fallback (when no AI API key is available) ─────────────────────
function getRuleBasedResponse(message: string, language: string): string {
  const msg = message.toLowerCase();
  const si  = language === 'si';

  // WCLWD
  if (msg.includes('wclwd') || msg.includes('yellowing') || msg.includes('flaccid') || msg.includes('drying') || msg.includes('කහ') || msg.includes('වේලෙ')) {
    return si
      ? `**WCLWD (Weligama Coconut Leaf Wilt Disease)**\n\nමෙය ශ්‍රී ලංකාවේ සිටින බරපතලම පොල් රෝගයයි.\n\n**රෝග ලක්ෂණ:**\n• කොළ කහ/ගොඩ වීම\n• ශාඛා ගිලා වැටීම\n• ගෙඩි කලින් ඇද වැටීම\n\n**ප්‍රතිකාරය:**\n• ප්‍රතිකාරයක් නොමැත!\n• CRISL ට **වහාම** දැනුම් දෙන්න: +94 37 228 5000\n• Imidacloprid ෙයාදා ලීෆ්හොපර් පාලනය කරන්න\n• ආසාදිත ගස් ඉවත් කිරීම සලකා බලන්න`
      : `**WCLWD (Weligama Coconut Leaf Wilt Disease)**\n\nThis is the most serious coconut disease in Sri Lanka.\n\n**Symptoms:** Yellowing of fronds, flaccidity/drooping, premature nut fall\n\n**Treatment:**\n• No cure exists!\n• Contact CRISL **immediately**: +94 37 228 5000\n• Control leafhopper vectors with Imidacloprid\n• Consider removal of severely infected trees\n• Isolate affected area to prevent spread`;
  }

  // Bud Rot
  if (msg.includes('bud rot') || msg.includes('බද් රොට්') || msg.includes('crown rot')) {
    return si
      ? `**බද් රොට් රෝගය** 🔴 අනතුරුදායක\n\n**හේතුව:** Phytophthora palmivora දිලීර\n\n**රෝග ලක්ෂණ:**\n• නිශ්ශාඛ කොළ කහ වීම\n• කිණිහිරි දිරාපත් වීම\n• දුර්ගන්ධය\n\n**ප්‍රතිකාරය:**\n• ආසාදිත කොටස් **ඉවත් කරන්න**\n• Copper Oxychloride (3g/L) ඉසිනු\n• දින 10 ෙකොට ස්ප්‍රේ කරන්න\n\n**පොහොර:** NPK 12-12-17 + Magnesium sulfate`
      : `**Bud Rot** 🔴 Critical\n\n**Cause:** Phytophthora palmivora fungus\n\n**Symptoms:** Yellowing of spindle leaf, rotting of bud with foul smell, crown collapse\n\n**Treatment:**\n• Remove and destroy infected bud tissue\n• Apply Copper Oxychloride (3g/L) to the crown\n• Repeat spray every 10 days\n• Improve drainage around tree\n\n**Fertilizer:** NPK 12-12-17 with Magnesium sulfate`;
  }

  // Stem Bleeding
  if (msg.includes('stem bleed') || msg.includes('ස්ටෙම් ලේ') || msg.includes('bleeding')) {
    return si
      ? `**ස්ටෙම් ලේ වැගිරීම** 🔴 අනතුරුදායක\n\n**හේතුව:** Thielaviopsis paradoxa දිලීර\n\n**රෝග ලක්ෂණ:**\n• කඳෙන් අඳුරු දියර ගැලීම\n• ගෙඩි නිෂ්පාදනය අඩු වීම\n\n**ප්‍රතිකාරය:**\n• සෞඛ්‍ය සම්පන්න ලී දෙකෙ ෙකොට ආසාදිත ස්ථාන කපා ගන්න\n• Bordeaux paste ගාන්න\n• රෙදි කඩෙකින් ආවරණය කරන්න\n\n**පොහොර:** Boron + Copper micronutrients`
      : `**Stem Bleeding** 🔴 Critical\n\n**Cause:** Thielaviopsis paradoxa fungus\n\n**Symptoms:** Dark brown/black liquid oozing from trunk cracks, internal rot\n\n**Treatment:**\n• Chisel out ALL infected tissue until healthy wood is visible\n• Apply Bordeaux paste (1:1:10) to the wound\n• Wrap with cloth to prevent re-infection\n• Avoid trunk injuries\n\n**Fertilizer:** Balanced fertilizer with boron and copper micronutrients`;
  }

  // Gray Leaf Spot
  if (msg.includes('gray leaf') || msg.includes('grey leaf') || msg.includes('ග්‍රේ ලීෆ්') || msg.includes('leaf spot')) {
    return si
      ? `**ග්‍රේ ලීෆ් ස්පොට්** 🟡 මධ්‍යම\n\n**හේතුව:** Pestalotiopsis palmarum දිලීර\n\n**ප්‍රතිකාරය:**\n• Mancozeb (2g/L) දින 14 ෙකොට ගස් 3 ක් ඉසිනු\n• ආසාදිත ශාඛා ගිනි ෙතා දවන්න\n\n**පොහොර:** Potassium sulphate + Zinc + Manganese micronutrients`
      : `**Gray Leaf Spot** 🟡 Medium Severity\n\n**Cause:** Pestalotiopsis palmarum fungus\n\n**Treatment:**\n• Spray Mancozeb fungicide (2g/L) every 14 days for 3 applications\n• Remove and burn heavily infected fronds\n• Improve air circulation\n\n**Fertilizer:** Potassium sulphate (0-0-50) with zinc and manganese micronutrients`;
  }

  // Fertilizer
  if (msg.includes('fertilizer') || msg.includes('fertiliser') || msg.includes('පොහොර') || msg.includes('nutrient')) {
    return si
      ? `**පොල් ගස් සඳහා පොහොර මාර්ගෝපදේශය** 🌱\n\n**සාමාන්‍ය:**\n• NPK 14-14-14 — ගස් 500g බැගින් මාස 3 ෙකොට\n• Magnesium sulfate 100g — වසරකට 2 ෙවනි\n\n**රෝග සුවය සඳහා:**\n• Potassium sulphate — ශිෂ්ටය ශක්තිමත් කිරීමට\n• Boron + Copper — Stem Bleeding සඳහා\n• Calcium nitrate — Leaf Rot සඳහා\n\n**වාර ඵල:** ලිතර 10 කාබනික කොම්පෝස්ට් + NPK සෑම මාස 3 කටම`
      : `**Coconut Fertilizer Guide** 🌱\n\n**General Maintenance:**\n• NPK 14-14-14 at 500g per tree every 3 months\n• Magnesium sulfate 100g twice yearly\n\n**For Disease Recovery:**\n• Potassium sulphate — strengthens cell walls\n• Boron + Copper micronutrients — for Stem Bleeding\n• Calcium nitrate — for Leaf Rot\n\n**Organic:** 10kg compost per tree every 3 months\n\n**Tip:** Always water after applying fertilizer.`;
  }

  // Watering
  if (msg.includes('water') || msg.includes('irrigat') || msg.includes('වතුර') || msg.includes('ජල')) {
    return si
      ? `**පොල් ගස් ජල සැපයීම** 💧\n\n• **ශ්‍රී ලංකාව:** වාර්ෂිකව mm 1300-2300 අවශ්‍ය\n• **වියළි ඍතු:** සතිය 2 ෙකොට ගස් 40-50 ලිතර\n• **වර්ෂා ඍතු:** ස්වාභාවික වර්ෂාව ප්‍රමාණවත්\n• **තරුණ ගස් (1-3 Yrs):** සතිය 2 ෙකොට ජලය\n• **වර්ශ 4+:** දෙ සති ෙකොට ජලය`
      : `**Coconut Tree Watering Guide** 💧\n\n• **Sri Lanka:** Needs 1300-2300mm rainfall annually\n• **Dry season:** Water every 2 weeks, 40-50 liters per tree\n• **Rainy season:** Natural rainfall usually sufficient\n• **Young trees (1-3 yrs):** Water twice per week\n• **Mature trees (4+ yrs):** Water every 2 weeks\n\n**Tip:** Mulching around the base retains soil moisture.`;
  }

  // CRISL contact
  if (msg.includes('crisl') || msg.includes('contact') || msg.includes('සම්බන්ධ')) {
    return si
      ? `**CRISL (Coconut Research Institute of Sri Lanka)** 📞\n\n• **දුරකතන:** +94 37 228 5000\n• **වෙබ් අඩවිය:** www.cocoaboard.lk\n• **ලිපිනය:** Bandirippuwa Estate, Lunuwila, Sri Lanka\n\n**CRISL ට සම්බන්ධ විය යුතු රෝග:**\n• WCLWD (Weligama Coconut Leaf Wilt Disease)\n• නොහඳුනා රෝග ලක්ෂණ\n• ව්‍යාප්ත රෝග ලෙල`
      : `**CRISL (Coconut Research Institute of Sri Lanka)** 📞\n\n• **Phone:** +94 37 228 5000\n• **Website:** www.cocoaboard.lk\n• **Address:** Bandirippuwa Estate, Lunuwila, Sri Lanka\n\n**When to contact CRISL:**\n• WCLWD suspected cases (mandatory)\n• Unknown disease symptoms\n• Disease outbreak in your plantation`;
  }

  // Not related to coconuts
  if (!msg.includes('coconut') && !msg.includes('palm') && !msg.includes('disease') && !msg.includes('leaf')
    && !msg.includes('farming') && !msg.includes('fertilizer') && !msg.includes('tree')
    && !msg.includes('පොල්') && !msg.includes('ගොවි') && !msg.includes('රෝග') && !msg.includes('ගස')) {
    return si
      ? `සමාවෙන්න, මට **පොල් ගොවිතැන සහ රෝග** ගැන පමණක් සාකච්ඡා කළ හැකිය.\n\nමෙවැනි ප්‍රශ්න අසන්න:\n• "බද් රොට් ප්‍රතිකාරය කුමක්ද?"\n• "WCLWD රෝග ලක්ෂණ?"\n• "පොල් ගස් සඳහා කුමන පොහොර?"` 
      : `I'm sorry, I can only discuss **coconut farming and diseases**.\n\nTry asking:\n• "What is Bud Rot treatment?"\n• "WCLWD symptoms?"\n• "What fertilizer for coconut trees?"\n\nOr visit the **Disease Library** page for visual information.`;
  }

  // Generic fallback
  return si
    ? `මට ඔබේ ප්‍රශ්නයට නිශ්චිත පිළිතුරක් ලබා දීමට අපහසු විය. 🌴\n\nකරුණාකර **වඩා නිශ්චිත** ලෙස අසන්න. උදාහරණ:\n• "බද් රොට් රෝගය ප්‍රතිකාරය?"\n• "ග්‍රේ ලීෆ් ස්පොට් රෝග ලක්ෂණ?"\n• "CRISL සම්බන්ධ කරන්නේ කෙසේද?"`
    : `I'm not sure about that. 🌴 Try asking:\n\n🌿 **About diseases:**\n• "What is Bud Rot?"\n• "How to treat Stem Bleeding?"\n• "What are WCLWD symptoms?"\n\n🌾 **About farming:**\n• "How often should I water coconut trees?"\n• "What fertilizer should I use?"\n\n📞 **Emergency:** "How to contact CRISL?"`;
}