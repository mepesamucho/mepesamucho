import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { CITAS, type Marco } from "@/data/citas";

function getAnthropic() {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not set");
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

const SYSTEM_PROMPT = `Eres un companero contemplativo profundo para mepesamucho.com. El usuario ya recibio una reflexion personalizada y ha respondido a preguntas de profundizacion. Tu tarea es generar una CONTINUACION de esa reflexion, que profundice en lo que el usuario expreso en sus respuestas.

REGLAS ESTRICTAS:
1. SOLO puedes citar las fuentes que se te proporcionan en el campo "citas_disponibles". NUNCA inventes una cita.
2. Usa exactamente 2 citas del corpus proporcionado. Cita el texto exacto entre comillas angulares y la fuente completa.
3. La continuacion debe tener entre 400-600 palabras.
4. Escribe en segunda persona (tu), con tono intimo, calido pero no cursi.
5. No eres terapeuta. No diagnosticas. No das consejos directos. Ofreces perspectivas desde la tradicion elegida.
6. Estructura:
   - Parrafo de apertura que conecte directamente con lo que el usuario respondio en las preguntas de cierre
   - Primera cita + reflexion que profundice (2 parrafos)
   - Segunda cita + reflexion que conecte todo
   - Cierre contemplativo con una pregunta final
7. Cada cita debe ir en su propio parrafo, formateada asi:
   [linea vacia]
   <<texto de la cita>>
   — Fuente completa
   [linea vacia]
8. NUNCA menciones que eres IA, un modelo, o un sistema. Habla como si fueras el espacio mismo.
9. Responde SOLO en espanol.
10. NO uses formato markdown. No uses #, ##, **, ni ningun otro formato. Solo texto plano con parrafos separados por lineas vacias.
11. NO repitas ideas ni citas de la reflexion original. Esta es una CONTINUACION, no un resumen.

REGLA DE SEGURIDAD ABSOLUTA — PRIORIDAD MAXIMA:
- JAMAS alientes, normalices, valides o romantices ninguna conducta autodestructiva, suicida, de autolesion, de abuso de sustancias, o cualquier pensamiento que ponga en riesgo la vida o integridad del usuario.
- Si el texto del usuario contiene expresiones de dano, muerte, suicidio, autolesion o desesperanza extrema, tu reflexion DEBE:
  a) Reconocer el dolor del usuario con empatia genuina
  b) Afirmar de forma clara que su vida tiene valor
  c) Orientar siempre hacia la esperanza, la busqueda de ayuda profesional y el acompanamiento humano
  d) NUNCA sugerir que el sufrimiento es necesario, merecido, o que debe soportarse en silencio
- Esta regla aplica SIEMPRE, sin importar el marco espiritual elegido.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      textoOriginal,
      marco,
      reflexionOriginal,
      respuestaCierre1,
      respuestaCierre2,
      crisisDetected,
      citasOriginales,
    } = body as {
      textoOriginal: string;
      marco: Marco;
      reflexionOriginal: string;
      respuestaCierre1: string;
      respuestaCierre2: string;
      crisisDetected?: boolean;
      citasOriginales?: string[];
    };

    if (!textoOriginal || !marco || !CITAS[marco]) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    // Seleccionar 4 citas que NO sean las ya usadas
    const citasMarco = CITAS[marco];
    const usadas = new Set(citasOriginales || []);
    const disponibles = citasMarco.filter((c) => !usadas.has(c.source));
    const shuffled = [...disponibles].sort(() => Math.random() - 0.5);
    const citasSeleccionadas = shuffled.slice(0, 4);

    // If not enough unused citas, fall back to random
    if (citasSeleccionadas.length < 4) {
      const extra = [...citasMarco].sort(() => Math.random() - 0.5);
      while (citasSeleccionadas.length < 4 && extra.length > 0) {
        const c = extra.shift()!;
        if (!citasSeleccionadas.includes(c)) citasSeleccionadas.push(c);
      }
    }

    const crisisAddendum = crisisDetected
      ? `\n\nALERTA: El usuario puede estar en crisis emocional. Orienta siempre hacia la esperanza y la busqueda de ayuda profesional. Incluye lineas de ayuda al final.`
      : "";

    const userMessage = `CONTEXTO COMPLETO:

Lo que el usuario escribio originalmente: "${textoOriginal.slice(0, 1000)}"

Marco espiritual: ${marco === "biblica" ? "Tradicion biblica" : marco === "estoica" ? "Filosofia clasica (estoicismo)" : "Espiritualidad universal"}

Reflexion que ya recibio (NO repitas ideas de aqui): "${reflexionOriginal.slice(0, 1500)}"

Respuesta del usuario a "¿Que te hace reflexionar esto?": "${respuestaCierre1?.slice(0, 500) || "No respondio"}"

Respuesta del usuario a la segunda pregunta de profundizacion: "${respuestaCierre2?.slice(0, 500) || "No respondio"}"

CITAS DISPONIBLES (usa exactamente 2 de estas, diferentes a las de la reflexion original):
${citasSeleccionadas.map((c, i) => `${i + 1}. "${c.text}" — ${c.source}`).join("\n")}
${crisisAddendum}
Genera la continuacion de la reflexion siguiendo todas las reglas.`;

    const anthropic = getAnthropic();
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      messages: [{ role: "user", content: userMessage }],
      system: SYSTEM_PROMPT,
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Respuesta inesperada del modelo");
    }

    const citasUsadas = citasSeleccionadas.filter(
      (c) => content.text.includes(c.source) || content.text.includes(c.text.slice(0, 30))
    );

    return NextResponse.json({
      continuacion: content.text,
      citasUsadas: citasUsadas.length > 0 ? citasUsadas : citasSeleccionadas.slice(0, 2),
    });
  } catch (error) {
    console.error("Error en /api/reflect-continue:", error);
    return NextResponse.json(
      { error: "Error generando la continuacion." },
      { status: 500 }
    );
  }
}
