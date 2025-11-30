import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return Response.json({ error: "GEMINI_API_KEY missing" }, { status: 500 });

    const { messages, eventData } = await req.json();
    if (!messages?.length) return Response.json({ error: "No messages" }, { status: 400 });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const systemPrompt = `Та шинэ жилийн үдэшлэгийн AI хост.
Зөвхөн Монгол кирилл үсэг болон дараах тэмдэгтүүд ашигла: space ? ! . - ' " : , 
Emoji, латин үсэг, тоо, бусад тэмдэгт бүү ашигла.
Товч, эелдэг хариул.
Үйл ажиллагааны өгөгдөл:
${eventData}`;

    const lastUser = messages[messages.length - 1].text;
    const prompt = `${systemPrompt}\n\nUser: ${lastUser}`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text();
    return Response.json({ reply });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}