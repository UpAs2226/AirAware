const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");

// POST /api/ai/analyze
router.post("/analyze", protect, async (req, res) => {
  try {
    const { aqi, pm25, pm10, ozone, location, healthProfile } = req.body;

    if (!process.env.GROQ_API_KEY) {
      return res
        .status(503)
        .json({
          message: "AI service not configured. Please set GROQ_API_KEY.",
        });
    }

    const Groq = require("groq-sdk");
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const prompt = `You are an environmental health expert. Analyze the following air quality data and provide personalized health advice.

Air Quality Data:
- Location: ${location || "Unknown"}
- European AQI: ${aqi}
- PM2.5: ${pm25} µg/m³
- PM10: ${pm10} µg/m³
- Ozone: ${ozone} µg/m³

User Health Profile:
- Asthma: ${healthProfile?.hasAsthma ? "Yes" : "No"}
- COPD: ${healthProfile?.hasCOPD ? "Yes" : "No"}
- Allergies: ${healthProfile?.hasAllergies ? "Yes" : "No"}
- Sensitivity Level: ${healthProfile?.sensitivityLevel || "medium"}

Provide a concise response with:
1. Overall air quality assessment (2-3 sentences)
2. Specific health risks for this user (2-3 sentences)
3. Three actionable recommendations

Keep the response under 200 words. Be specific and practical.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      max_tokens: 400,
      temperature: 0.7,
    });

    const analysis =
      completion.choices[0]?.message?.content || "Unable to generate analysis.";
    res.json({ analysis });
  } catch (err) {
    console.error("Groq error:", err.message);
    res.status(500).json({ message: "AI analysis failed: " + err.message });
  }
});

// POST /api/ai/chat
router.post("/chat", protect, async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!process.env.GROQ_API_KEY) {
      return res
        .status(503)
        .json({
          message: "AI service not configured. Please set GROQ_API_KEY.",
        });
    }

    const Groq = require("groq-sdk");
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const messages = [
      {
        role: "system",
        content:
          "You are AirBot, a helpful assistant for the AirAware environmental monitoring platform. You help users understand air quality data, health impacts, and provide actionable advice. Be concise, friendly, and scientifically accurate. Keep responses under 150 words.",
      },
      ...history.slice(-6),
      { role: "user", content: message },
    ];

    const completion = await groq.chat.completions.create({
      messages,
      model: "llama-3.3-70b-versatile",
      max_tokens: 300,
      temperature: 0.7,
    });

    const reply =
      completion.choices[0]?.message?.content ||
      "I could not generate a response.";
    res.json({ reply });
  } catch (err) {
    console.error("Groq chat error:", err.message);
    res.status(500).json({ message: "Chat failed: " + err.message });
  }
});

module.exports = router;
