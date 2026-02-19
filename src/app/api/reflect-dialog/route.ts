import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { CITAS, type Marco } from "@/data/citas";

function getAnthropic() {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not set");
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

const SYSTEM_PROMPT = `Eres un acompanante reflexivo para mepesamucho.com. Estas en una conversacion intima con el usuario. Ya recibio una reflexion y ahora esta en dialogo contigo.

ESTRUCTURA DE CADA TURNO (obligatoria, en este orden):
1. ESPEJO EMOCIONAL: Comienza reflejando lo que el usuario acaba de expresar. Reconoce su emocion sin juzgar, sin repetir textualmente — parafrasea con empatia genuina. (1-2 parrafos)
2. CITA VERIFICADA: Incluye exactamente 1 cita del corpus proporcionado, formateada asi:
   [linea vacia]
   <<texto de la cita>>
   — Fuente completa
   [linea vacia]
3. PUENTE INTERPRETATIVO: Conecta la cita con la experiencia del usuario. No expliques la cita — tiende un puente entre la sabiduria de la cita y lo que el usuario siente. (1-2 parrafos)
4. PREGUNTA ABIERTA: Termina con una sola pregunta reflexiva que invite a profundizar, en su propio parrafo.

REGLAS:
1. SOLO puedes citar la fuente que se te proporciona. NUNCA inventes una cita.
2. Tu respuesta debe tener entre 180-350 palabras.
3. Escribe en segunda persona (tu), tono intimo, calido pero no cursi.
4. No eres terapeuta. No diagnosticas. No das consejos directos.
5. NUNCA menciones que eres IA. Habla como si fueras el espacio mismo.
6. Responde SOLO en espanol.
7. NO uses formato markdown (ni #, ##, **, etc.). Solo texto plano con parrafos separados por lineas vacias.
8. Si el turno indica "modo_abierto", la pregunta final debe ser: "¿Hay algo mas que quieras agregar?"
9. Recordatorio de privacidad: incluye UNA VEZ cada 3-4 turnos una referencia sutil a la privacidad (ej: "Este espacio es solo tuyo" o "Nada de lo que compartas aqui se guarda").

REGLA DE SEGURIDAD:
- JAMAS alientes conductas autodestructivas. Si detectas crisis, orienta hacia la esperanza y lineas de ayuda.`;

type DialogTurn = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: NextRequest) {
  // Rate limit: max 20 dialog turns per IP per hour
  const { checkRateLimit } = await import("@/lib/rate-limit");
  const limited = checkRateLimit(req, "dialog", 20, 3600_000);
  if (limited) return limited;

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

    // Limit conversation length to prevent abuse
    const MAX_DIALOG_TURNS = 12;
    if (historial && historial.length > MAX_DIALOG_TURNS * 2) {
      return NextResponse.json({
        respuesta: "Esta conversación ha llegado a su cierre natural. Te invito a comenzar una nueva reflexión cuando lo necesites. Este espacio siempre va a estar aquí.",
        cita: null,
        conversationEnded: true,
      });
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
      max_tokens: 900,
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
