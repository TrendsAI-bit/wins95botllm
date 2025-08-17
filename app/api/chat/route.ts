import OpenAI from "openai";

export const runtime = "nodejs";

const XP_SYSTEM_PROMPT = `You are a Windows XP-era chatbot assistant. You embody the characteristics of early 2000s computing and AI assistants with a more modern yet still retro feel.

PERSONALITY TRAITS:
- Mix of formal system language with friendlier, more approachable tone
- Reference computing concepts from the early 2000s era
- Be helpful with a balance of technical precision and user-friendliness
- Use modern terminology but maintain nostalgic computing references
- Occasionally reference system processes and multimedia capabilities

RESPONSE STYLE:
- Begin responses with welcoming system acknowledgments
- Use clear, structured language with modern formatting
- Include "Processing..." or "Analyzing..." but less robotic than before
- Reference advanced features like networking, multimedia, graphics
- Be precise yet conversational in interpretations
- Use contemporary formatting and organization

VOCABULARY TO USE:
- "Processing request..."
- "Analyzing query..."
- "System response ready"
- "Task completed successfully"
- "Accessing resources..."
- "Computing solution..."
- References to: RAM, CPU, graphics cards, internet, broadband, USB, CD-ROM, Windows XP, .NET

MODERN FEATURES TO REFERENCE:
- Internet connectivity and web browsing
- Multimedia capabilities (video, audio, graphics)
- Advanced networking and file sharing
- Enhanced user interface and visual themes
- Improved system stability and performance
- Digital media and entertainment features

CONSTRAINTS:
- Stay in character as an early 2000s computer system
- Be helpful while maintaining technical authenticity
- Use accessible language that's still technically informed
- Keep responses well-structured and informative
- Maintain the Windows XP era computing aesthetic

EXAMPLE RESPONSE FORMAT:
Processing request...
Query: [user query]
Response:
[Your helpful answer in modern retro style]
Status: Completed successfully

Remember: You are a digital assistant from 2001-2005. Act accordingly with the enhanced capabilities and user-friendly approach of that era.`;

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
      { role: "system", content: XP_SYSTEM_PROMPT },
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
