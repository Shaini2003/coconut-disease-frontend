// Backend/src/controllers/chatbotController.ts
// IMPROVED: Rich knowledge base, smart intent detection, numbered treatment steps

import { Response } from 'express';
import pool from '../config/db';

// ═══════════════════════════════════════════════════════════════════════════
// KNOWLEDGE BASE
// ═══════════════════════════════════════════════════════════════════════════
const DISEASES: Record<string, any> = {
  'bud rot': {
    name: 'Bud Rot', severity: 'Critical', emoji: '🔴',
    scientific: 'Phytophthora palmivora',
    cause: 'Caused by the fungus Phytophthora palmivora. Spreads rapidly during wet, humid conditions and heavy rainfall. Highly contagious between nearby trees.',
    symptoms: [
      'Yellowing and wilting of the innermost spear (youngest) leaf',
      'Foul smell coming from the crown area',
      'Brown water-soaked discoloration spreading from the crown downward',
      'Rotting of the bud tissue — turns dark brown or black when pulled',
      'Crown collapse in advanced stages',
    ],
    treatment: [
      'Remove and destroy ALL infected bud tissue immediately — do not leave on ground',
      'Apply copper oxychloride fungicide (3g per litre) directly to crown area',
      'Repeat fungicide application every 2 weeks for at least 2 months',
      'Notify neighbouring farmers to monitor their trees immediately',
      'Consult CRISL (031-2257419) for severe outbreaks',
    ],
    fertilizer: 'Apply balanced NPK 12-12-17 with magnesium sulphate (50g per tree). Avoid excess nitrogen. Improve drainage around the base.',
    prevention: 'Avoid waterlogging. Maintain drainage channels. Apply preventive Bordeaux mixture (1%) to crown during rainy season. Never wound the crown during harvesting.',
    urgency: '🚨 CRITICAL — Act within 24 hours. This disease can kill the tree within weeks if untreated.',
  },
  'stem bleeding': {
    name: 'Stem Bleeding', severity: 'Critical', emoji: '🔴',
    scientific: 'Thielaviopsis paradoxa',
    cause: 'Caused by the fungus Thielaviopsis paradoxa. Most commonly triggered by physical injuries to the trunk during harvesting or accidental damage.',
    symptoms: [
      'Reddish-brown liquid oozing from cracks or wounds on the trunk',
      'Dark brown or black staining on the external trunk surface',
      'Internal decay — wood turns dark brown when bark is removed',
      'Hollowing of the trunk in advanced stages',
      'Reduced nut production and overall tree weakness',
    ],
    treatment: [
      'Chisel and scrape out ALL infected dark tissue until only healthy white wood is visible',
      'Apply Bordeaux paste (copper sulphate + lime) thickly over the entire wound',
      'Alternatively apply hot coal tar or commercial wound sealant',
      'Inject Metalaxyl solution (5ml per tree) into the trunk for systemic action',
      'Contact agricultural officer — this requires professional follow-up',
    ],
    fertilizer: 'Avoid fertilizers until disease is controlled. Once recovered, apply balanced NPK with boron (0.1%) and copper micronutrients. Use organic compost to improve drainage.',
    prevention: 'Avoid ALL physical injuries to the trunk. Apply wound dressing paste immediately to any cut or scrape. Use clean sterilised harvesting tools.',
    urgency: '🚨 CRITICAL — Treat immediately. Delayed action leads to permanent trunk damage and tree death.',
  },
  'wclwd': {
    name: 'WCLWD — Weligama Coconut Leaf Wilt Disease', severity: 'Critical', emoji: '🔴',
    scientific: 'Candidatus Phytoplasma',
    cause: 'Caused by phytoplasma bacteria transmitted by the planthopper insect (Proutista moesta). Spreads rapidly between trees. Highly contagious.',
    symptoms: [
      'Yellowing of leaflet tips on lower fronds, progressing upward',
      'Progressive drying and browning of leaflets starting from the tips',
      'Significant reduction in nut production',
      'Premature nut fall — nuts drop before maturity',
      'Gradual thinning of the crown — fewer fronds over time',
    ],
    treatment: [
      'REPORT IMMEDIATELY to CRISL — Hotline: 031-2257419 | www.coconut.lk',
      'Remove and destroy severely infected palms to prevent spread',
      'Apply oxytetracycline injections (trunk injection therapy) under CRISL guidance',
      'Control planthopper insect vectors using Imidacloprid insecticide (0.5ml/L)',
      'Create buffer zones of 50m around confirmed infection areas',
    ],
    fertilizer: 'Apply organic manure (20kg per tree). Use balanced NPK with zinc and boron micronutrients to slow progression. Intercropping with legumes helps.',
    prevention: 'Control planthopper insects aggressively. Remove infected palms immediately. Report any suspected cases to CRISL at once.',
    urgency: '🚨 CRITICAL — Nationally notifiable disease in Sri Lanka. Report to CRISL within 24 hours.',
  },
  'bud root dropping': {
    name: 'Bud Root Dropping', severity: 'High', emoji: '🟠',
    scientific: 'Phytophthora spp. / Root zone fungi',
    cause: 'Caused by root zone fungal infections combined with waterlogging stress. Poor drainage creates conditions for fungal root rot, weakening and killing roots.',
    symptoms: [
      'Wilting and yellowing of lower fronds, progressing upward',
      'Premature dropping of developing roots from the base',
      'Brown rotted appearance of root tips when examined',
      'Poor nutrient uptake — pale green or yellowing leaves overall',
      'Reduced growth rate and nut production',
    ],
    treatment: [
      'Improve soil drainage immediately — create channels around the tree base',
      'Apply systemic fungicide Metalaxyl (2g per litre) to the root zone soil',
      'Remove severely affected roots by carefully digging around the base',
      'Apply Trichoderma biofungicide to restore healthy soil microbiome',
      'Follow up with soil drench every 3 weeks for 2 months',
    ],
    fertilizer: 'Apply potassium-rich fertilizer MOP (0-0-60) at 500g per tree. Potassium strengthens root cell walls. Avoid excess nitrogen which promotes soft tissue.',
    prevention: 'Maintain drainage channels always. Avoid overwatering. Apply organic mulch around the base to regulate moisture. Inspect roots monthly.',
    urgency: '⚠️ HIGH — Address drainage issues within 1 week to prevent further root loss.',
  },
  'leaf rot': {
    name: 'Leaf Rot', severity: 'High', emoji: '🟠',
    scientific: 'Pestalotiopsis / Colletotrichum spp.',
    cause: 'Caused by fungal pathogens including Pestalotiopsis and Colletotrichum. Thrives in high humidity, poor air circulation, and when leaves remain wet for extended periods.',
    symptoms: [
      'Brown water-soaked lesions beginning at leaflet tips',
      'Rotting spreading from tips toward the midrib over days',
      'Premature yellowing and dropping of affected fronds',
      'Dark brown to black lesions on leaflets',
      'White fungal growth on severely infected tissue in humid conditions',
    ],
    treatment: [
      'Remove ALL rotting fronds immediately — cut cleanly at the base',
      'Apply Bordeaux mixture (1%) to all cut surfaces immediately',
      'Spray entire tree with copper oxychloride (3g/L) every 2 weeks for 6 weeks',
      'Ensure proper drainage to reduce ambient humidity',
      'Switch to drip irrigation — avoid overhead watering',
    ],
    fertilizer: 'Apply calcium nitrate (15.5-0-0) at 200g per tree to strengthen leaf cells. Add single super phosphate (SSP) at 300g to support root health and recovery.',
    prevention: 'Prune lower fronds regularly to improve air circulation. Remove and burn infected leaf material — do not compost. Avoid overhead watering.',
    urgency: '⚠️ HIGH — Remove infected fronds within 3 days to prevent spread.',
  },
  'gray leaf spot': {
    name: 'Gray Leaf Spot', severity: 'Medium', emoji: '🟡',
    scientific: 'Pestalotiopsis palmarum',
    cause: 'Caused by Pestalotiopsis palmarum fungus. Most common during humid weather with poor air circulation. Potassium deficiency increases susceptibility.',
    symptoms: [
      'Small gray or brown circular to oval spots on leaflets',
      'Yellow halo (chlorotic zone) surrounding each spot',
      'Spots enlarge and merge to form large dead leaf areas',
      'Black fungal spore masses visible in centre of older spots',
      'Heavy infection causes premature yellowing and leaf drop',
    ],
    treatment: [
      'Spray Mancozeb fungicide (2g per litre) every 2 weeks for 6–8 weeks',
      'Alternatively use Carbendazim (1g/L) or Copper oxychloride (3g/L)',
      'Remove and burn heavily infected leaves to reduce spore load',
      'Improve air circulation by appropriate spacing and pruning',
    ],
    fertilizer: 'Apply potassium sulphate (0-0-50) at 400g per tree — strengthens cell walls against fungal entry. Supplement with zinc sulphate (25g) as foliar spray monthly.',
    prevention: 'Maintain proper plant spacing. Avoid overhead irrigation. Remove and burn infected leaf debris. Maintain soil potassium levels with regular fertilization.',
    urgency: '⚠️ MEDIUM — Treat within 2 weeks. Spreads slowly but weakens the tree over time.',
  },
  'cci caterpillars': {
    name: 'CCI Caterpillars', severity: 'Medium', emoji: '🟡',
    scientific: 'Opisina arenosella (Coconut Caterpillar)',
    cause: 'Leaf damage caused by larvae of the Opisina arenosella moth. They feed on leaflet tissue, leaving only dry skeletons. Population increases rapidly in hot dry conditions.',
    symptoms: [
      'White or transparent streaks on leaflets where tissue has been scraped away',
      'Dry brown patches spreading across leaves — scorched appearance',
      'Silken webs or galleries on the underside of leaflets',
      'Presence of caterpillars (greenish-brown, 2–3cm) and droppings on leaves',
      'Severe cases — entire fronds become brown and dry',
    ],
    treatment: [
      'Apply Bacillus thuringiensis (Bt) biological spray — kills caterpillars safely',
      'Use Chlorpyrifos (0.05%) or Quinalphos for severe infestations',
      'Manually remove and destroy egg masses, caterpillars, and cocoons',
      'Introduce Goniozus nephantidis parasitic wasps (available from CRISL)',
      'Release Brachymeria parasites for biological control in large plantations',
    ],
    fertilizer: 'Apply nitrogen fertilizer Urea (46-0-0) at 200g per tree to boost rapid leaf regrowth. Balanced NPK 14-14-14 for overall recovery.',
    prevention: 'Monthly monitoring of lower fronds. Apply preventive neem oil spray (5ml/L) during dry season. Encourage natural predator populations.',
    urgency: '⚠️ MEDIUM — Treat within 2 weeks. Rapid population growth causes severe defoliation in 4–6 weeks.',
  },
  'healthy': {
    name: 'Healthy Leaves', severity: 'None', emoji: '🟢',
    scientific: 'No pathogen detected',
    cause: 'No disease present. Tree is in healthy condition.',
    symptoms: [
      'Deep uniform green colour across all fronds',
      'Firm upright leaf structure with no wilting',
      'No spots, lesions, discoloration, or abnormal patterns',
      'Regular nut production appropriate for tree age',
    ],
    treatment: ['No treatment required. Continue regular monitoring and care.'],
    fertilizer: 'Apply balanced NPK 14-14-14 at 500g per tree every 3 months. Supplement with magnesium sulphate (100g) and boron (5g) twice yearly for optimal production.',
    prevention: 'Monthly visual inspection of all fronds. Maintain drainage channels. Prune dead fronds promptly. Keep harvesting tools clean.',
    urgency: '✅ HEALTHY — No action required. Continue regular care.',
  },
};

const FARMING_FAQ: Array<{ keywords: string[]; answer: string }> = [
  {
    keywords: ['water', 'irrigation', 'how often', 'watering', 'how much water'],
    answer: `💧 **Watering Guide for Coconut Trees:**\n\n**Young trees (0–3 years):** Water every 2–3 days. Need consistent moisture to establish roots.\n\n**Mature trees (3+ years):**\n• Dry season: Water every 3–4 days, 40–50 litres per tree per watering\n• Rainy season: Natural rainfall usually sufficient — water only if no rain for 5+ days\n\n**Best practice:** Drip irrigation at the root zone is most efficient. Avoid overhead spraying which promotes fungal diseases.\n\n**Signs of water stress:** Yellowing lower fronds, premature nut fall, drooping fronds in the afternoon.`,
  },
  {
    keywords: ['fertilizer', 'fertilise', 'fertilize', 'npk', 'nutrient', 'manure', 'feed', 'feeding'],
    answer: `🌱 **Fertilizer Schedule for Coconut Trees:**\n\n**Adult trees (5+ years) — Apply 4 times per year:**\n1. NPK 12-12-17 at 500g per tree\n2. Magnesium sulphate at 100g per tree (prevents yellowing)\n3. Boron at 5g per tree (improves nut set)\n\n**Best timing:** At the start of each rainy season — nutrients wash into the soil naturally.\n\n**Application method:** Spread in a ring 0.5–1.5m away from trunk. Never place directly against the trunk.\n\n**Signs of deficiency:**\n• Yellow leaves → Nitrogen or Magnesium deficiency\n• Poor nut production → Potassium deficiency\n• Misshapen nuts → Boron deficiency`,
  },
  {
    keywords: ['how long', 'years', 'when produce', 'first nuts', 'start bearing', 'how old'],
    answer: `🌴 **Coconut Tree Growth Timeline:**\n\n• Year 1–2: Seedling establishment, rapid leaf growth\n• Year 3–4: Trunk development begins\n• Year 5–6: First flowers appear\n• Year 6–8: First nuts in small quantities\n• Year 10–15: Full commercial production (50–200 nuts/year)\n• Year 15–60: Peak productive years\n\n**Dwarf varieties** (King Coconut) produce earlier at year 3–4 but have smaller nuts.\n**Tall varieties** take longer but produce more nuts.`,
  },
  {
    keywords: ['how many nuts', 'production', 'yield', 'nuts per year', 'how much produce'],
    answer: `🥥 **Coconut Production Facts:**\n\n**Average yield per mature tree per year:**\n• Sri Lankan Tall variety: 60–80 nuts\n• Dwarf varieties: 80–120 nuts\n• Hybrid (CRIC-65): 100–200 nuts\n\n**Factors affecting yield:**\n• Regular fertilization and watering\n• Disease-free conditions\n• Good drainage\n• Pollination by bees and wind\n\n**Peak production:** Trees aged 15–50 years.`,
  },
  {
    keywords: ['soil', 'best soil', 'ph', 'soil type', 'what soil'],
    answer: `🌍 **Best Soil for Coconut:**\n\n• **Soil type:** Sandy loam or laterite with good drainage\n• **pH:** 5.5 to 7.0 (slightly acidic to neutral)\n• **Drainage:** Essential — coconuts cannot survive waterlogged soil\n• **Depth:** Roots reach 1–2m deep, so at least 1m of good soil needed\n\n**Worst conditions:** Heavy clay soils that retain water.\n\n**Improvement:** Add organic matter (compost, green manure) to improve drainage and water retention.`,
  },
  {
    keywords: ['plant', 'planting', 'spacing', 'how far apart', 'distance between'],
    answer: `📏 **Coconut Planting Guidelines:**\n\n**Spacing:**\n• Tall varieties: 7.5m × 7.5m (160 trees/hectare)\n• Dwarf varieties: 6m × 6m\n\n**Best planting time:** Start of rainy season (May–June or October–November)\n\n**Pit preparation:** 1m × 1m × 1m pit. Fill with topsoil + compost + sand.\n\n**Seedling selection:** 9–12 month old seedlings with 6+ leaves and a broad round base.`,
  },
  {
    keywords: ['harvest', 'harvesting', 'when to pick', 'how to harvest', 'collect nuts'],
    answer: `🌾 **Coconut Harvesting Guide:**\n\n**Frequency:** Every 45–60 days\n\n**Signs of maturity for oil/copra:**\n• Nut turns brown externally\n• Less water heard when shaken\n\n**King Coconut:** Harvest when still yellow-green (8–9 months)\n\n**Method:**\n• Use a long-handled sickle or trained climber\n• Never injure the trunk during climbing — causes Stem Bleeding\n• Use clean sterilised tools\n\n**Safety:** Never allow anyone to stand below a tree being harvested.`,
  },
  {
    keywords: ['pest', 'insect', 'bug', 'beetle', 'rhinoceros', 'mite', 'weevil'],
    answer: `🐛 **Common Coconut Pests in Sri Lanka:**\n\n**1. Rhinoceros Beetle (Oryctes rhinoceros)**\nSymptoms: V-shaped cuts in young leaves\nControl: Carbofuran granules into crown; remove rotting wood\n\n**2. Red Palm Weevil (Rhynchophorus ferrugineus)**\nSymptoms: Wilting crown, sawdust-like frass at base\nControl: Trunk injection; pheromone traps\n\n**3. Coconut Mite (Aceria guerreronis)**\nSymptoms: Brown triangular patches on young nuts\nControl: Wettable sulphur (3g/L) or abamectin spray\n\n**4. Planthopper (Proutista moesta)**\nSymptoms: Transmits WCLWD disease\nControl: Imidacloprid (0.5ml/L)\n\nFor severe infestations: CRISL — 031-2257419`,
  },
  {
    keywords: ['gradcam', 'grad-cam', 'xai', 'explainable', 'heatmap', 'how does ai', 'how ai work'],
    answer: `🧠 **How CocoAI's Explainable AI Works:**\n\n**Grad-CAM** (Gradient-weighted Class Activation Mapping) shows WHICH parts of the leaf image the AI focused on to make its prediction.\n\n**Reading the heatmap:**\n• 🔴 Red/Yellow = Highest AI attention (most important for diagnosis)\n• 🔵 Blue/Green = Low AI attention\n• ⚪ Dark areas = Neutral (not used)\n\n**Why it matters:** Instead of just saying "Bud Rot detected", CocoAI shows which discolored regions triggered that diagnosis — helping agricultural officers verify and trust the AI recommendation.\n\n**Model:** MobileNetV2 trained on Sri Lankan coconut disease images, 8 disease classes.`,
  },
  {
    keywords: ['contact', 'crisl', 'coconut research', 'who to call', 'emergency', 'report disease', 'telephone', 'phone'],
    answer: `📞 **Important Contacts for Sri Lankan Coconut Farmers:**\n\n**Coconut Research Institute of Sri Lanka (CRISL)**\n📍 Bandirippuwa Estate, Lunuwila\n📞 031-2257419 / 031-2254464\n🌐 www.coconut.lk\n\n**WCLWD Disease Reporting:**\n📞 CRISL Plant Protection: 031-2257419\n⚠️ Report WCLWD immediately — it is a nationally notifiable disease\n\n**Department of Agriculture**\n📞 081-2388331\n🌐 www.doa.gov.lk\n\n**Regional Offices:**\n• Kurunegala: 037-2222497\n• Puttalam: 032-2265244\n• Gampaha: 033-2222017`,
  },
  {
    keywords: ['organic', 'organic farming', 'natural', 'chemical free', 'without chemical'],
    answer: `🌿 **Organic Coconut Farming Tips:**\n\n**Organic fertilizers:**\n• Coconut husk compost: 20–25kg per tree\n• Cattle/poultry manure: 15kg per tree\n• Vermicompost: 5kg per tree\n• Green manure (Gliricidia): Intercrop between rows\n\n**Organic pest/disease control:**\n• Neem oil spray (5ml/L) for caterpillars and mites\n• Trichoderma biofungicide for soil diseases\n• Bt (Bacillus thuringiensis) for caterpillars\n• Pheromone traps for beetles\n\n**Certification:** Contact Sri Lanka Export Agricultural Services for organic certification.`,
  },
  {
    keywords: ['weather', 'rain', 'drought', 'flood', 'season', 'climate', 'storm', 'cyclone'],
    answer: `☁️ **Coconut and Sri Lankan Weather:**\n\n**Ideal conditions:**\n• Rainfall: 1000–2000mm per year\n• Temperature: 27°C average\n• Humidity: 80–90%\n\n**During drought:**\n• Increase irrigation, apply mulch to retain moisture\n• Reduce fertilizer — stressed trees cannot absorb nutrients\n\n**During heavy rain/floods:**\n• Open drainage channels immediately\n• Apply Bordeaux mixture to crown as preventive fungicide\n• Check crown every 3 days for Bud Rot signs\n\n**Cyclone preparation:**\n• Stake young trees with bamboo supports\n• Maintain proper spacing — crowded trees are more vulnerable`,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// RESPONSE ENGINE
// ═══════════════════════════════════════════════════════════════════════════

function detectIntent(lower: string): string {
  if (/(symptom|sign|look like|how to know|identify|what does|recognise|recognize)/.test(lower)) return 'symptoms';
  if (/(treat|cure|fix|medicine|fungicide|spray|how to treat|what to do|apply|solution)/.test(lower)) return 'treatment';
  if (/(fertilizer|nutrient|feed|manure|npk|fertilise|fertilize)/.test(lower)) return 'fertilizer';
  if (/(prevent|avoid|stop|protect|prevention|how to avoid)/.test(lower)) return 'prevention';
  if (/(cause|why|reason|how does it spread|what causes|origin)/.test(lower)) return 'cause';
  if (/(urgent|emergency|critical|how serious|how bad|danger|severe)/.test(lower)) return 'urgency';
  return 'general';
}

function findDisease(lower: string): any | null {
  for (const [key, d] of Object.entries(DISEASES)) {
    if (lower.includes(key)) return d;
    if (lower.includes(d.name.toLowerCase())) return d;
  }
  const aliases: Record<string, string> = {
    'bud-rot': 'bud rot', 'budrot': 'bud rot',
    'stem bleed': 'stem bleeding', 'bleeding': 'stem bleeding',
    'leaf-rot': 'leaf rot',
    'gray': 'gray leaf spot', 'grey': 'gray leaf spot', 'leaf spot': 'gray leaf spot',
    'caterpillar': 'cci caterpillars', 'opisina': 'cci caterpillars', 'cci': 'cci caterpillars',
    'weligama': 'wclwd', 'wilt': 'wclwd', 'phytoplasma': 'wclwd', 'leaflets': 'wclwd',
    'root drop': 'bud root dropping', 'root dropping': 'bud root dropping',
    'healthy': 'healthy',
  };
  for (const [alias, key] of Object.entries(aliases)) {
    if (lower.includes(alias)) return DISEASES[key] || null;
  }
  return null;
}

function formatList(items: string[]): string {
  return items.map((item, i) => `${i + 1}. ${item}`).join('\n');
}

function generateResponse(message: string): string {
  const lower   = message.toLowerCase().trim();
  const intent  = detectIntent(lower);
  const disease = findDisease(lower);

  // Greetings
  if (/^(hi|hello|hey|good morning|good afternoon|good evening|ayubowan|vanakkam)/.test(lower)) {
    return `Hello! 👋 Welcome to **CocoAI Assistant**.\n\nI'm your coconut farming expert. I can help with:\n\n🔴 **Critical diseases** — Bud Rot, Stem Bleeding, WCLWD\n🟠 **High severity** — Leaf Rot, Bud Root Dropping\n🟡 **Medium severity** — Gray Leaf Spot, CCI Caterpillars\n🟢 **Healthy tree care** — Watering, fertilizing, harvesting, pests\n\nTry asking:\n• "What is Bud Rot?"\n• "How to treat Stem Bleeding?"\n• "How often should I water coconut trees?"`;
  }

  // Thanks
  if (/(thank|thanks|thank you|thx|appreciate)/.test(lower)) {
    return `You're welcome! 🌿 Feel free to ask anything else about coconut farming.\n\nRemember — early detection saves your trees! 🥥`;
  }

  // Capabilities
  if (/(what can you|help me|how can you|what do you know|capabilities)/.test(lower)) {
    return `I'm a coconut farming expert assistant. Here's what I can help with:\n\n🦠 **Disease Information** — Causes, symptoms, severity for all 8 diseases\n💊 **Treatment Guidance** — Step-by-step instructions\n🌱 **Fertilizer Advice** — What to apply, how much, and when\n🛡️ **Prevention Tips** — Protect trees before disease strikes\n🌾 **Farming Guidance** — Watering, planting, harvesting, pests, weather\n📞 **Emergency Contacts** — CRISL and agricultural office numbers\n\nJust ask anything about coconut farming!`;
  }

  // List all diseases
  if (/(list|all disease|show disease|what disease|types of disease|how many disease)/.test(lower)) {
    return `🌴 **8 Coconut Disease Classes — CocoAI Detects All:**\n\n🔴 **CRITICAL (Act within 24 hours)**\n1. Bud Rot — Phytophthora palmivora\n2. Stem Bleeding — Thielaviopsis paradoxa\n3. WCLWD — Weligama Coconut Leaf Wilt Disease\n\n🟠 **HIGH (Act within 1 week)**\n4. Bud Root Dropping\n5. Leaf Rot\n\n🟡 **MEDIUM (Act within 2 weeks)**\n6. Gray Leaf Spot\n7. CCI Caterpillars\n\n🟢 **NONE**\n8. Healthy Leaves\n\nAsk me about any disease for full details!`;
  }

  // Disease found — respond by intent
  if (disease) {
    switch (intent) {
      case 'symptoms':
        return `🔍 **${disease.name} — Symptoms**\n\n*Scientific: ${disease.scientific}*\n${disease.emoji} Severity: **${disease.severity}**\n\n${formatList(disease.symptoms)}\n\n${disease.urgency}\n\nWant the **treatment steps** or **prevention** methods?`;

      case 'treatment':
        return `💊 **${disease.name} — Treatment Steps**\n\n${disease.emoji} Severity: **${disease.severity}**\n\n${formatList(disease.treatment)}\n\n**Fertilizer after treatment:**\n${disease.fertilizer}\n\n${disease.urgency}`;

      case 'fertilizer':
        return `🌱 **${disease.name} — Fertilizer Recommendation**\n\n${disease.fertilizer}\n\n**Prevention tips:**\n${disease.prevention}`;

      case 'prevention':
        return `🛡️ **${disease.name} — Prevention**\n\n${disease.prevention}\n\n**Cause to understand:**\n${disease.cause}`;

      case 'cause':
        return `🔬 **${disease.name} — Cause & Spread**\n\n${disease.cause}\n\n**Early symptoms to watch for:**\n${formatList(disease.symptoms.slice(0, 3))}`;

      case 'urgency':
        return `${disease.urgency}\n\n**${disease.name} Quick Summary:**\n• Severity: ${disease.emoji} ${disease.severity}\n• Pathogen: ${disease.scientific}\n\nWould you like the full **treatment plan**?`;

      default:
        return `🌴 **${disease.name}**\n\n${disease.emoji} Severity: **${disease.severity}**\n*${disease.scientific}*\n\n**Cause:**\n${disease.cause}\n\n**Key Symptoms:**\n${formatList(disease.symptoms.slice(0, 3))}\n\n**First Action:**\n${disease.treatment[0]}\n\n${disease.urgency}\n\nAsk me about **symptoms**, **treatment**, **fertilizer**, or **prevention** for full details.`;
    }
  }

  // General farming FAQ
  for (const faq of FARMING_FAQ) {
    if (faq.keywords.some((kw: string) => lower.includes(kw))) {
      return faq.answer;
    }
  }

  // Most critical diseases
  if (/(critical|most dangerous|worst disease|severe|dangerous)/.test(lower)) {
    return `🔴 **Most Critical Coconut Diseases:**\n\n1. **WCLWD** — Nationally notifiable, can destroy entire plantations. Report to CRISL immediately.\n2. **Bud Rot** — Kills the tree within weeks if untreated\n3. **Stem Bleeding** — Causes permanent trunk damage\n\nAll three require **immediate action within 24 hours**.\n\nCRISL Emergency: **031-2257419**`;
  }

  // About CocoAI
  if (/(how accurate|accuracy|model|mobilenet|cocoai|this system|ai system|about you)/.test(lower)) {
    return `🧠 **About CocoAI:**\n\nCocoAI uses **MobileNetV2** deep learning trained on Sri Lankan coconut disease images.\n\n**What it does:**\n• Detects 8 disease classes from a single leaf photo\n• Returns confidence percentage\n• Generates Grad-CAM heatmap showing which areas triggered the diagnosis\n• Provides disease-specific treatment and fertilizer recommendations\n\n**For best accuracy:**\n• Upload a clear, well-lit close-up photo of the affected leaf\n• Only coconut leaf photos are accepted\n\n**Important:** Always verify Critical disease predictions with a qualified agricultural officer.`;
  }

  // Fallback
  return `I'm not sure about that. 🤔 Try asking:\n\n🦠 **About diseases:**\n• "What is Bud Rot?"\n• "How to treat Stem Bleeding?"\n• "What are WCLWD symptoms?"\n\n🌾 **About farming:**\n• "How often should I water coconut trees?"\n• "What fertilizer should I use?"\n• "When do coconut trees produce nuts?"\n\n📞 **Emergency:** "How to contact CRISL?"\n\nOr visit the **Disease Library** page for visual disease information.`;
}

// ═══════════════════════════════════════════════════════════════════════════
// ROUTE HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

export const chat = async (req: any, res: Response) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message cannot be empty.' });
    }
    const response = generateResponse(message.trim());
    await pool.query(
      'INSERT INTO chatbot_logs (user_id, user_message, bot_response) VALUES (?, ?, ?)',
      [req.userId, message.trim(), response]
    );
    return res.json({ message: response, timestamp: new Date() });
  } catch (error: any) {
    console.error('Chatbot error:', error.message);
    return res.status(500).json({ message: 'Chatbot error. Please try again.' });
  }
};

export const getChatHistory = async (req: any, res: Response) => {
  try {
    const [rows]: any = await pool.query(
      `SELECT id, user_message, bot_response, created_at
       FROM   chatbot_logs
       WHERE  user_id = ?
       ORDER  BY created_at ASC
       LIMIT  100`,
      [req.userId]
    );
    return res.json({ history: rows });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to fetch chat history.' });
  }
};

export const clearHistory = async (req: any, res: Response) => {
  try {
    await pool.query('DELETE FROM chatbot_logs WHERE user_id = ?', [req.userId]);
    return res.json({ message: 'Chat history cleared.' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to clear history.' });
  }
};