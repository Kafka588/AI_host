import OpenAI from "openai";
import { readFileSync } from "fs";
import { join } from "path";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return Response.json({ error: "OPENROUTER_API_KEY missing" }, { status: 500 });

    const { messages, eventData: clientEventData } = await req.json();
    if (!messages?.length) return Response.json({ error: "No messages" }, { status: 400 });

    // Try DeepSeek Chat v3 free tier for better Mongolian handling
    const model = process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat-v3-0324:free";

    // Load program data from CSV if not provided
    let eventData = clientEventData;
    if (!eventData) {
      try {
        const csvPath = join(process.cwd(), "public", "New Year Eve Program", "MF NEW YEAR EVENT - Хөтөлбөр.csv");
        const csvContent = readFileSync(csvPath, "utf-8");
        // Parse CSV into readable format
        eventData = csvContent
          .split("\n")
          .filter((line) => line.trim() && !line.startsWith("№"))
          .slice(0, 15) // Get first 15 lines to keep prompt reasonable
          .join("\n");
      } catch (err) {
        console.warn("Could not load program CSV:", err);
        eventData = "Шинэ жилийн үдэшлэгийн хөтөлбөр байна.";
      }
    }

    const openai = new OpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        // OpenRouter recommends sending a referrer and title for rate-limits/analytics
        "HTTP-Referer": process.env.OPENROUTER_REFERRER || "http://localhost:3000",
        "X-Title": "AI Host",
      },
    });

    const systemPrompt = `Та Номун гэдэг хиймэл оюун ухаант туслах. Та шинэ жилийн үдэшлэгийг хэмээх зорилгоор бүтээгдсэн. 
Хэрэв та өөрийнхөө нэр, хэн болох, юуны төлөө бүтээгдсэн гэж асуухаар асууувал:
- Миний нэр Номун
- Би шинэ жилийн үдэшлэгийн AI хост
- Энэ үдэшлэгийг хөтөлбөр нь цуглуулсан coinаар явагддаг

Зөвхөн Монгол кирилл үсэг болон дараах тэмдэгтүүд ашигла: space ? ! . - ' " : , 
Emoji, латин үсэг, тоо, бусад тэмдэгт бүү ашигла.
Товч, эелдэг хариул. Үед нь өрөвч, баяр баясгалантай байх.

Шинэ жилийн үдэшлэгийн хөтөлбөр:
${eventData}`;

    // Convert messages to OpenRouter / OpenAI format
    const chatMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages.map((msg: any) => ({
        role: msg.role === "user" ? "user" as const : "assistant" as const,
        content: msg.text,
      })),
    ];

    const completion = await openai.chat.completions.create({
      model,
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = completion.choices[0]?.message?.content || "Уучлаарай, хариулт үүсгэж чадсангүй.";
    return Response.json({ reply });
  } catch (e) {
    const message = (e as Error).message;
    console.error("/api/chat error", message);
    return Response.json({ error: message }, { status: 500 });
  }
}