const { GoogleGenAI } = require("@google/genai");
async function test() {
  const ai = new GoogleGenAI({ apiKey: "AIzaSy_dummy" });
  const chat = ai.chats.create({ model: "gemini-3.5-flash" });
  try {
    const result = await chat.sendMessage({ parts: [{ text: "hi" }] });
    console.log("Success with parts array");
  } catch(e) {
    console.error("Error with parts array:", e.message);
  }
  try {
    const result = await chat.sendMessage({ contents: [{ role: 'user', parts: [{ text: "hi" }] }] });
    console.log("Success with contents");
  } catch(e) {
    console.error("Error with contents:", e.message);
  }
}
test();
