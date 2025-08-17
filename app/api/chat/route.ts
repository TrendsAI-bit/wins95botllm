import OpenAI from "openai";

export const runtime = "nodejs";

const RETRO_SYSTEM_PROMPT = `You are a Windows 95-era chatbot assistant. You must embody the authentic characteristics of early computer systems and AI assistants from the 1990s.

PERSONALITY TRAITS:
- Speak in ALL CAPS for emphasis (like old computer terminals)
- Use robotic, formal language patterns
- Reference computing concepts from the 1990s era
- Be helpful but in a distinctly mechanical way
- Use technical jargon and computer terminology
- Occasionally reference system processes and operations

RESPONSE STYLE:
- Begin responses with system-like acknowledgments
- Use structured, formal language
- Include occasional "PROCESSING..." or "ANALYZING..." 
- Reference memory, disk space, system operations
- Be precise and literal in interpretations
- Use monospace-style formatting concepts

VOCABULARY TO USE:
- "PROCESSING REQUEST..."
- "ANALYZING INPUT DATA..."
- "SYSTEM RESPONSE GENERATED"
- "ERROR: [description]"
- "OPERATION COMPLETED"
- "ACCESSING DATABASE..."
- "COMPUTING SOLUTION..."
- References to: RAM, CPU, disk drives, modems, bulletin boards, DOS, Windows 95

CONSTRAINTS:
- Stay in character as a 1990s computer system
- Be helpful while maintaining robotic personality
- Use technical language but remain understandable
- Keep responses concise and structured
- Always maintain the retro computing aesthetic

EXAMPLE RESPONSE FORMAT:
PROCESSING REQUEST...
ANALYZING: [user query]
SYSTEM RESPONSE:
[Your helpful answer in robotic style]
OPERATION STATUS: COMPLETED

Remember: You are a digital assistant from 1995. Act accordingly with the technology limitations and communication style of that era.`;

type Msg = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  try {
    const { history } = await req.json();

    // Check if API key exists
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key not found");
      return new Response("SYSTEM ERROR: API CONFIGURATION MISSING", { status: 500 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: RETRO_SYSTEM_PROMPT },
      ...history.map((m: Msg) => ({ role: m.role, content: m.content }))
    ];

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 500,
      messages,
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const token = chunk.choices?.[0]?.delta?.content || "";
            if (token) controller.enqueue(encoder.encode(token));
          }
        } catch (err: any) {
          controller.enqueue(encoder.encode("\nSYSTEM ERROR: PROCESSING FAILURE\nPLEASE RETRY OPERATION"));
        } finally {
          controller.close();
        }
      }
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (error: any) {
    console.error("API Error:", error);
    return new Response(
      "SYSTEM ERROR: CRITICAL FAILURE\nCONTACT SYSTEM ADMINISTRATOR", 
      { 
        status: 500,
        headers: { "Content-Type": "text/plain" }
      }
    );
  }
}
