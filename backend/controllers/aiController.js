const Groq = require('groq-sdk');
const { AILog } = require('../models/misc');
const Crop = require('../models/Crop');
const SoilData = require('../models/SoilData');

const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
    throw new Error('Groq API key not configured. Please set GROQ_API_KEY in your .env file.');
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

const SYSTEM_PROMPT = `You are an expert agricultural AI assistant for the Smart Agriculture Monitoring System. 
You help farmers with:
- Crop disease diagnosis and treatment
- Soil health analysis and fertilizer recommendations
- Irrigation scheduling advice
- Weather impact on crops
- Pest management
- General farming best practices

Be concise, practical, and use simple language. Always prioritize eco-friendly and sustainable solutions.`;

// @desc  AI Chatbot for farmer support
// @route POST /api/ai/chat
exports.chat = async (req, res) => {
  try {
    const { message, cropId, conversationHistory = [] } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

    const groq = getGroqClient();

    // Build context
    let contextNote = '';
    if (cropId) {
      const crop = await Crop.findById(cropId);
      if (crop) contextNote = `\n[Farmer's crop context: ${crop.name} variety ${crop.variety || 'unknown'}, stage: ${crop.currentStage}, health: ${crop.healthStatus}]`;
    }

    const messages = [
      ...conversationHistory.slice(-10), // keep last 10 messages for context
      { role: 'user', content: message + contextNote },
    ];

    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || 'llama3-8b-8192',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      max_tokens: 500,
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;

    // Log AI interaction
    await AILog.create({
      user: req.user._id,
      type: 'chatbot',
      input: message,
      output: reply,
      model: process.env.GROQ_MODEL,
      tokensUsed: completion.usage?.total_tokens,
      cropContext: cropId || undefined,
    });

    res.json({ success: true, reply, usage: completion.usage });
  } catch (err) {
    if (err.message.includes('Groq API key')) {
      return res.status(503).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  AI Crop Disease Detection (text-based analysis of symptoms)
// @route POST /api/ai/disease-detect
exports.diseaseDetect = async (req, res) => {
  try {
    const { symptoms, cropName, cropId } = req.body;
    if (!symptoms) return res.status(400).json({ success: false, message: 'Symptoms description is required' });

    const groq = getGroqClient();
    const prompt = `A farmer reports the following symptoms on their ${cropName || 'crop'}:
"${symptoms}"

Analyze these symptoms and provide:
1. Most likely disease/pest (name it clearly)
2. Confidence level (high/medium/low)
3. Immediate action required
4. Treatment recommendation (organic and chemical options)
5. Prevention for the future

Format your response as JSON with keys: disease, confidence, immediateAction, treatment, prevention`;

    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || 'llama3-8b-8192',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      max_tokens: 600,
      temperature: 0.3,
    });

    let analysis;
    try {
      const text = completion.choices[0].message.content;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: text };
    } catch {
      analysis = { raw: completion.choices[0].message.content };
    }

    // Update crop if provided
    if (cropId && analysis.disease) {
      await Crop.findByIdAndUpdate(cropId, {
        $push: {
          aiDiseaseAnalysis: {
            disease: analysis.disease,
            confidence: analysis.confidence === 'high' ? 90 : analysis.confidence === 'medium' ? 65 : 40,
            recommendation: analysis.treatment,
            analyzedAt: new Date(),
          },
        },
        healthStatus: analysis.confidence === 'high' ? 'critical' : 'warning',
      });
    }

    await AILog.create({
      user: req.user._id,
      type: 'disease_detection',
      input: symptoms,
      output: JSON.stringify(analysis),
      model: process.env.GROQ_MODEL,
      cropContext: cropId || undefined,
    });

    res.json({ success: true, analysis });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  AI Soil Analysis Recommendation
// @route POST /api/ai/soil-analysis
exports.soilAnalysis = async (req, res) => {
  try {
    const { soilDataId, cropName } = req.body;
    const soil = await SoilData.findById(soilDataId);
    if (!soil) return res.status(404).json({ success: false, message: 'Soil data not found' });

    const groq = getGroqClient();
    const prompt = `Analyze the following soil data for growing ${cropName || 'general crops'}:
pH: ${soil.ph}
Moisture: ${soil.moisture}%
Nitrogen: ${soil.nitrogen} mg/kg
Phosphorus: ${soil.phosphorus} mg/kg  
Potassium: ${soil.potassium} mg/kg
Organic Matter: ${soil.organicMatter}%
Temperature: ${soil.temperature}°C

Provide JSON response with: summary, deficiencies, recommendations (array), fertilizers (array), suitableForCrop (boolean), improvementSteps (array)`;

    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || 'llama3-8b-8192',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: prompt }],
      max_tokens: 600,
      temperature: 0.3,
    });

    let recommendation;
    try {
      const text = completion.choices[0].message.content;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      recommendation = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: text };
    } catch {
      recommendation = { raw: completion.choices[0].message.content };
    }

    // Save recommendation back to soil record
    await SoilData.findByIdAndUpdate(soilDataId, {
      aiRecommendation: JSON.stringify(recommendation),
    });

    res.json({ success: true, recommendation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get AI logs for user
// @route GET /api/ai/logs
exports.getAILogs = async (req, res) => {
  try {
    const logs = await AILog.find({ user: req.user._id }).sort('-createdAt').limit(50);
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
