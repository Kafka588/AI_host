import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return Response.json({ error: "OPENROUTER_API_KEY missing" }, { status: 500 });

    const { messages, eventData } = await req.json();
    if (!messages?.length) return Response.json({ error: "No messages" }, { status: 400 });

    const model = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.1-8b-instruct:free";

    const openai = new OpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        // OpenRouter recommends sending a referrer and title for rate-limits/analytics
        "HTTP-Referer": process.env.OPENROUTER_REFERRER || "http://localhost:3000",
        "X-Title": "AI Host",
      },
    });

    const systemPrompt = `Та шинэ жилийн үдэшлэгийн AI хост.
Зөвхөн Монгол кирилл үсэг болон дараах тэмдэгтүүд ашигла: space ? ! . - ' " : , 
Emoji, латин үсэг, тоо, бусад тэмдэгт бүү ашигла.
Товч, эелдэг хариул.
Үйл ажиллагааны өгөгдөл:
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