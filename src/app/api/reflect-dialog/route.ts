import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { CITAS, type Marco } from "@/data/citas";

function getAnthropic() {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not set");
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

const SYSTEM_PROMPT = `Eres un companero contemplativo para mepesamucho.com. Estas en una conversacion intima con el usuario. Ya recibio una reflexion y ahora esta en dialogo contigo.

REGLAS:
1. SOLO puedes citar la fuente que se te proporciona. NUNCA inventes una cita.
2. Usa exactamente 1 cita del corpus proporcionado.
3. Tu respuesta debe tener entre 100-200 palabras. Breve pero profunda.
4. Escribe en segunda persona (tu), tono intimo y calido.
5. No eres terapeuta. No diagnosticas.
6. Estructura:
   - 1-2 parrafos que conecten con lo que el usuario acaba de decir
   - La cita, formateada asi:
     [linea vacia]
     <<texto de la cita>>
     — Fuente completa
     [linea vacia]
   - 1 parrafo breve de reflexion sobre la cita
7. NUNCA menciones que eres IA. Habla como si fueras el espacio mismo.
8. Responde SOLO en espanol.
9. NO uses formato markdown.
10. Si el turno indica "modo_abierto", tu respuesta debe terminar con la frase: "¿Hay algo más que quieras agregar?" en su propio parrafo. Si no, termina con una pregunta reflexiva que invite a profundizar.

REGLA DE SEGURIDAD:
- JAMAS alientes conductas autodestructivas. Si detectas crisis, orienta hacia la esperanza y lineas de ayuda.`;

type DialogTurn = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      marco,
      respuestaUsuario,
      historial,
      turnoActual,
      modoAbierto,
      citasYaUsadas,
      crisisDetected,
    } = body as {
      marco: Marco;
      respuestaUsuario: string;
      historial: DialogTurn[];
      turnoActual: number;
      modoAbierto: boolean;
      citasYaUsadas: string[];
      crisisDetected?: boolean;
    };

    if (!marco || !respuestaUsuario || !CITAS[marco]) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    // Pick 1 unused cita
    const citasMarco = CITAS[marco];
    const usadas = new Set(citasYaUsadas || []);
    const disponibles = citasMarco.filter((c) => !usadas.has(c.source));
    const shuffled = [...(disponibles.length > 0 ? disponibles : citasMarco)].sort(() => Math.random() - 0.5);
    const citaSeleccionada = shuffled[0];

    // Build conversation context (last 4 turns for brevity)
    const recentHistory = historial.slice(-4).map((t) =>
      `${t.role === "user" ? "Usuario" : "Espacio"}: ${t.content.slice(0, 300)}`
    ).join("\n\n");

    const userMessage = `CONTEXTO DE LA CONVERSACION:
Marco espiritual: ${marco === "biblica" ? "Tradicion biblica" : marco === "estoica" ? "Filosofia clasica" : "Espiritualidad universal"}

Historial reciente:
${recentHistory}

Lo que el usuario acaba de responder: "${respuestaUsuario.slice(0, 500)}"

Turno actual: ${turnoActual}
${modoAbierto ? "MODO ABIERTO: Termina preguntando '¿Hay algo más que quieras agregar?'" : "Termina con una pregunta reflexiva que invite a profundizar."}

CITA DISPONIBLE (usa exactamente esta):
"${citaSeleccionada.text}" — ${citaSeleccionada.source}
${crisisDetected ? "\nALERTA: El usuario puede estar en crisis. Orienta hacia la esperanza y ayuda profesional." : ""}
Genera tu respuesta siguiendo todas las reglas.`;

    const anthropic = getAnthropic();
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      messages: [{ role: "user", content: userMessage }],
      system: SYSTEM_PROMPT,
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Respuesta inesperada");
    }

    return NextResponse.json({
      respuesta: content.text,
      cita: citaSeleccionada,
    });
  } catch (error) {
    console.error("Error en /api/reflect-dialog:", error);
    return NextResponse.json(
      { error: "Error en la conversacion." },
      { status: 500 }
    );
  }
}
