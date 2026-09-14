import { GoogleGenAI, Type, Schema } from '@google/genai';
import { AiAnalysis, ComplaintCategory, PriorityLevel, Complaint, Asset } from './types.js';

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
    try {
      geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.warn('Failed to initialize GoogleGenAI client:', e);
      geminiClient = null;
    }
  }
  return geminiClient;
}

// Local rule-based fallback classification engine
export function fallbackRuleBasedAnalysis(
  title: string,
  description: string,
  _roomNumber?: string,
  _block?: string
): AiAnalysis {
  const combined = `${title} ${description}`.toLowerCase();

  // Safety & Emergency Keywords
  const safetyKeywords = [
    'spark',
    'sparks',
    'smoke',
    'fire',
    'burning',
    'shock',
    'electric shock',
    'short circuit',
    'gas leak',
    'flooding',
    'burst pipe',
    'ceiling collapse',
    'exposed wire',
    'explosion',
  ];

  const hasSafetyRisk = safetyKeywords.some((kw) => combined.includes(kw));

  // Category detection patterns
  let category: ComplaintCategory = 'Room';
  let matchedKeywords: string[] = [];

  const electricalPatterns = [
    'fan',
    'light',
    'bulb',
    'switch',
    'socket',
    'plug',
    'wiring',
    'power',
    'voltage',
    'spark',
    'short circuit',
    'mcb',
    'tripped',
    'regulator',
    'fuse',
    'tube light',
    'air conditioner',
    'ac',
  ];
  const plumbingPatterns = [
    'tap',
    'pipe',
    'leak',
    'leaking',
    'geyser',
    'drain',
    'clogged',
    'overflow',
    'flush',
    'sink',
    'faucet',
    'seepage',
    'valve',
  ];
  const waterPatterns = [
    'water cooler',
    'ro purifier',
    'drinking water',
    'no water',
    'dirty water',
    'tank',
    'pump',
  ];
  const internetPatterns = [
    'wifi',
    'wi-fi',
    'internet',
    'router',
    'lan',
    'network',
    'slow speed',
    'ethernet',
    'dns',
  ];
  const furniturePatterns = [
    'bed',
    'chair',
    'table',
    'desk',
    'cupboard',
    'wardrobe',
    'hinge',
    'almirah',
    'mattress',
    'door lock',
    'latch',
    'handle',
  ];
  const cleaningPatterns = [
    'dust',
    'garbage',
    'trash',
    'clean',
    'cleaning',
    'sweep',
    'mop',
    'dirty corridor',
    'stain',
  ];
  const bathroomPatterns = [
    'toilet',
    'commode',
    'shower',
    'mirror',
    'bathroom door',
    'exhaust fan',
  ];

  if (hasSafetyRisk && (combined.includes('wire') || combined.includes('spark') || combined.includes('shock'))) {
    category = 'Electrical';
  } else if (electricalPatterns.some((k) => combined.includes(k))) {
    category = 'Electrical';
    matchedKeywords = electricalPatterns.filter((k) => combined.includes(k));
  } else if (waterPatterns.some((k) => combined.includes(k))) {
    category = 'Water';
    matchedKeywords = waterPatterns.filter((k) => combined.includes(k));
  } else if (plumbingPatterns.some((k) => combined.includes(k))) {
    category = 'Plumbing';
    matchedKeywords = plumbingPatterns.filter((k) => combined.includes(k));
  } else if (internetPatterns.some((k) => combined.includes(k))) {
    category = 'Internet';
    matchedKeywords = internetPatterns.filter((k) => combined.includes(k));
  } else if (furniturePatterns.some((k) => combined.includes(k))) {
    category = 'Furniture';
    matchedKeywords = furniturePatterns.filter((k) => combined.includes(k));
  } else if (cleaningPatterns.some((k) => combined.includes(k))) {
    category = 'Cleaning';
    matchedKeywords = cleaningPatterns.filter((k) => combined.includes(k));
  } else if (bathroomPatterns.some((k) => combined.includes(k))) {
    category = 'Bathroom';
    matchedKeywords = bathroomPatterns.filter((k) => combined.includes(k));
  }

  // Priority detection
  let priority: PriorityLevel = 'MEDIUM';
  let estimatedHours = 24;

  if (hasSafetyRisk || combined.includes('emergency') || combined.includes('hazard') || combined.includes('burst')) {
    priority = 'CRITICAL';
    estimatedHours = 2;
  } else if (
    combined.includes('urgent') ||
    combined.includes('immediately') ||
    combined.includes('flooding') ||
    combined.includes('no water') ||
    combined.includes('cannot sleep') ||
    combined.includes('exam') ||
    category === 'Water'
  ) {
    priority = 'HIGH';
    estimatedHours = 6;
  } else if (
    combined.includes('minor') ||
    combined.includes('creak') ||
    combined.includes('loose screw') ||
    category === 'Furniture' ||
    category === 'Cleaning'
  ) {
    priority = 'LOW';
    estimatedHours = 72;
  }

  // Root cause and recommendation heuristics
  let possibleRootCause = 'General component wear and tear or operational degradation';
  let recommendedAction = 'Technician on-site inspection and corrective maintenance';

  if (category === 'Electrical') {
    if (combined.includes('fan')) {
      possibleRootCause = 'Defective capacitor, worn motor bearing, or loose suspension bracket';
      recommendedAction = 'Test capacitor capacitance, inspect ceiling anchor pin, lubricate bearing housing';
    } else if (combined.includes('light') || combined.includes('bulb')) {
      possibleRootCause = 'Burnt LED driver or faulty lamp choke';
      recommendedAction = 'Test circuit voltage and replace lamp/fixture';
    } else if (combined.includes('switch') || combined.includes('socket')) {
      possibleRootCause = 'Arcing contacts or loose terminal screw behind switchboard';
      recommendedAction = 'De-energize circuit breaker, replace switch mechanism with ISI-rated unit';
    }
  } else if (category === 'Plumbing') {
    if (combined.includes('leak') || combined.includes('tap')) {
      possibleRootCause = 'Degraded internal rubber washer or corroded spindle cartridge';
      recommendedAction = 'Shut isolation valve, disassemble tap spindle, replace washer and Teflon seal';
    } else if (combined.includes('clog') || combined.includes('drain')) {
      possibleRootCause = 'Hair/debris accumulation in P-trap or waste outlet line';
      recommendedAction = 'Deploy mechanical drain auger and clear trap residue';
    }
  } else if (category === 'Internet') {
    possibleRootCause = 'Access point DHCP exhaustion or degraded PoE patch cord';
    recommendedAction = 'Reboot PoE switch port and verify ping latency and packet drop rates';
  }

  return {
    category,
    suggestedPriority: priority,
    confidence: 0.89,
    detectedKeywords: matchedKeywords.length > 0 ? matchedKeywords.slice(0, 5) : [category.toLowerCase()],
    safetyRiskDetected: hasSafetyRisk,
    possibleRootCause,
    recommendedAction,
    estimatedResolutionHours: estimatedHours,
    provider: 'rule-based-fallback',
  };
}

// AI-Assisted Complaint Analysis using Gemini 3.8 Flash
export async function analyzeComplaintWithAi(
  title: string,
  description: string,
  roomNumber?: string,
  block?: string
): Promise<AiAnalysis> {
  const client = getGeminiClient();

  if (!client) {
    return fallbackRuleBasedAnalysis(title, description, roomNumber, block);
  }

  try {
    const prompt = `You are the lead engineering diagnostician for HostelAssist, an enterprise smart hostel maintenance and operations platform.
Analyze the following student maintenance complaint:
Title: "${title}"
Description: "${description}"
Room / Location: "${roomNumber || 'Unknown'}", Block: "${block || 'Unknown'}"

Perform structured engineering triage:
1. Category must be one of: ["Electrical", "Plumbing", "Furniture", "Water", "Internet", "Cleaning", "Bathroom", "Room", "Safety", "Other"].
2. Priority must be one of: ["LOW", "MEDIUM", "HIGH", "CRITICAL"].
   - CRITICAL: Life safety risks (fire, electrical sparks, gas leak, building structural issues, severe flooding). SLA: 2 hrs.
   - HIGH: Major daily disruption (total water outage, no fan in hot weather, geyser failure in winter). SLA: 6 hrs.
   - MEDIUM: Moderate disruption (leaking tap, flickering light, slow Wi-Fi). SLA: 24 hrs.
   - LOW: Minor cosmetic or minor inconvenience (creaky door hinge, minor paint scratch). SLA: 72 hrs.
3. List 2 to 5 detected technical keywords.
4. Flag boolean safetyRiskDetected (true if danger of electrocution, fire, slippage, structural hazard).
5. State the most probable technical root cause.
6. Provide specific step-by-step recommended technician actions.
7. Estimate reasonable resolution hours.`;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              enum: [
                'Electrical',
                'Plumbing',
                'Furniture',
                'Water',
                'Internet',
                'Cleaning',
                'Bathroom',
                'Room',
                'Safety',
                'Other',
              ],
            },
            suggestedPriority: {
              type: Type.STRING,
              enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
            },
            confidence: { type: Type.NUMBER },
            detectedKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            safetyRiskDetected: { type: Type.BOOLEAN },
            possibleRootCause: { type: Type.STRING },
            recommendedAction: { type: Type.STRING },
            estimatedResolutionHours: { type: Type.INTEGER },
          },
          required: [
            'category',
            'suggestedPriority',
            'detectedKeywords',
            'safetyRiskDetected',
            'possibleRootCause',
            'recommendedAction',
            'estimatedResolutionHours',
          ],
        },
      },
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      return {
        category: parsed.category as ComplaintCategory,
        suggestedPriority: parsed.suggestedPriority as PriorityLevel,
        confidence: parsed.confidence || 0.96,
        detectedKeywords: parsed.detectedKeywords || [],
        safetyRiskDetected: Boolean(parsed.safetyRiskDetected),
        possibleRootCause: parsed.possibleRootCause,
        recommendedAction: parsed.recommendedAction,
        estimatedResolutionHours: parsed.estimatedResolutionHours || 4,
        provider: 'gemini',
      };
    }
  } catch (err) {
    console.warn('Gemini AI call failed, falling back to rule-based engine:', err);
  }

  return fallbackRuleBasedAnalysis(title, description, roomNumber, block);
}
