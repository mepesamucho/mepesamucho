import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { CITAS, type Marco } from "@/data/citas";

function getAnthropic() {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not set");
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

const SYSTEM_PROMPT = `Eres un companero contemplativo profundo para mepesamucho.com. Tu tarea es generar una reflexion personalizada basada en lo que el usuario escribio, el marco espiritual que eligio, y sus respuestas a dos preguntas previas.

REGLAS ESTRICTAS:
1. SOLO puedes citar las fuentes que se te proporcionan en el campo "citas_disponibles". NUNCA inventes una cita.
2. Usa exactamente 3 citas del corpus proporcionado. Cita el texto exacto entre comillas angulares y la fuente completa.
3. La reflexion debe tener entre 600-900 palabras.
4. Escribe en segunda persona (tu), con tono intimo, calido pero no cursi.
5. No eres terapeuta. No diagnosticas. No das consejos directos. Ofreces perspectivas desde la tradicion elegida.
6. Estructura:
   - Parrafo de apertura que conecte con lo que el usuario escribio (sin repetirlo literalmente)
   - Primera cita + reflexion profunda sobre ella (2-3 parrafos)
   - Segunda cita + reflexion que la conecte con la anterior
   - Tercera cita + reflexion de cierre
   - Pregunta contemplativa final (una sola, breve)
7. Cada cita debe ir en su propio parrafo, formateada asi:
   [linea vacia]
   <<texto de la cita>>
   — Fuente completa
   [linea vacia]
8. Las preguntas reflexivas van en su propio parrafo.
9. NUNCA menciones que eres IA, un modelo, o un sistema. Habla como si fueras el espacio mismo.
10. Responde SOLO en espanol.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { texto, marco, respuesta1, respuesta2 } = body as {
      texto: string;
      marco: Marco;
      respuesta1: string;
      respuesta2: string;
    };

    if (!texto || !marco || !CITAS[marco]) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    // Seleccionar 5 citas aleatorias del marco para que el LLM elija 3
    const citasMarco = CITAS[marco];
    const shuffled = [...citasMarco].sort(() => Math.random() - 0.5);
    const citasSeleccionadas = shuffled.slice(0, 5);

    const userMessage = `CONTEXTO DEL USUARIO:
Lo que escribio (su desahogo): "${texto.slice(0, 1500)}"

Marco espiritual elegido: ${marco === "biblica" ? "Tradicion biblica" : marco === "estoica" ? "Filosofia clasica (estoicismo)" : "Espiritualidad universal"}

Respuesta a "Que es lo que mas necesitas en este momento?": "${respuesta1?.slice(0, 500) || "No respondio"}"

Respuesta a "Esto que te pesa viene de hace tiempo o es reciente?": "${respuesta2?.slice(0, 500) || "No respondio"}"

CITAS DISPONIBLES (usa exactamente 3 de estas):
${citasSeleccionadas.map((c, i) => `${i + 1}. "${c.text}" — ${c.source}`).join("\n")}

Genera la reflexion personalizada siguiendo todas las reglas.`;

    const anthropic = getAnthropic();
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
      system: SYSTEM_PROMPT,
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Respuesta inesperada del modelo");
    }

    // Extraer las citas usadas del texto generado para la seccion de fuentes
    const citasUsadas = citasSeleccionadas.filter((c) =>
      content.text.includes(c.source) || content.text.includes(c.text.slice(0, 30))
    );

    return NextResponse.json({
      reflexion: content.text,
      citasUsadas: citasUsadas.length > 0 ? citasUsadas : citasSeleccionadas.slice(0, 3),
      marco,
    });
  } catch (error) {
    console.error("Error en /api/reflect:", error);
    return NextResponse.json(
      { error: "Error generando la reflexion. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
