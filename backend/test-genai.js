const { GoogleGenAI, Type } = require('@google/genai');

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_CHAT,
});

async function run() {
  try {
    const charisTools = {
      functionDeclarations: [
        {
          name: "get_financial_summary",
          description: "Get today's total sales",
          parameters: { type: Type.OBJECT, properties: {} }
        }
      ]
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: 'What is my financial summary?',
      config: {
        tools: [charisTools]
      }
    });

    console.log(JSON.stringify(response.functionCalls, null, 2));
  } catch (e) {
    console.error(e);
  }
}

run();
