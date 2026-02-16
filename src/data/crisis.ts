export const CRISIS_TRIGGERS = [
  // Suicidio
  "suicid", "quitarme la vida", "no quiero vivir", "quiero morir", "quiero morirme",
  "me quiero morir", "mejor muerto", "mejor muerta", "ya no quiero estar aqui",
  "ya no quiero seguir", "no vale la pena vivir", "acabar con todo",
  "terminar con todo", "ya no puedo mas", "no aguanto mas",
  "desaparecer del mundo", "ojala no existiera", "ojala estuviera muerto",
  "ojala estuviera muerta", "no quiero despertar", "me voy a matar",
  // Autolesion
  "cortarme", "me corto", "autolesion", "hacerme dano",
  "lastimarme", "herirme", "golpearme", "quemarme",
  // Muerte / desesperanza profunda
  "quiero estar muerto", "quiero estar muerta", "mejor sin mi",
  "mi familia estaria mejor sin mi", "todos estarian mejor sin mi",
  "nadie me necesita", "a nadie le importo", "no le importo a nadie",
  "soy una carga", "estorbo", "no sirvo para nada",
  // Adicciones en crisis
  "sobredosis", "me drogo", "no puedo dejar de tomar",
  "no puedo dejar de beber", "recai", "recaida",
  // Abuso
  "me pegan", "me golpean", "abuso", "me violan", "violencia",
  "me maltratan",
];

export interface CrisisLine {
  country: string;
  name: string;
  phone: string;
  note?: string;
  url?: string;
  isWeb?: boolean;
}

export const CRISIS_RESOURCES: { title: string; subtitle: string; lines: CrisisLine[] } = {
  title: "No estas solo. Hay personas preparadas para escucharte ahora mismo.",
  subtitle: "Si estas en peligro inmediato, llama a emergencias de tu pais.",
  lines: [
    { country: "Internacional", name: "Linea de crisis por chat", phone: "befrienders.org/find-support", url: "https://www.befrienders.org/find-support", isWeb: true },
    { country: "Mexico", name: "Linea de la Vida", phone: "800 911 2000", note: "24 horas, gratuita" },
    { country: "Mexico", name: "SAPTEL", phone: "55 5259 8121", note: "24 horas" },
    { country: "Estados Unidos", name: "988 Linea de Crisis (espanol)", phone: "988", note: "24 horas, llamar o enviar mensaje" },
    { country: "Espana", name: "Telefono de la Esperanza", phone: "717 003 717", note: "24 horas" },
    { country: "Argentina", name: "Centro de Asistencia al Suicida", phone: "(011) 5275-1135", note: "24 horas" },
    { country: "Colombia", name: "Linea 106", phone: "106", note: "24 horas, gratuita" },
    { country: "Chile", name: "Salud Responde", phone: "600 360 7777", note: "24 horas" },
  ],
};

export function detectarCrisis(texto: string): boolean {
  const lower = texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const lowerOriginal = texto.toLowerCase();
  return CRISIS_TRIGGERS.some(
    (trigger) =>
      lowerOriginal.includes(trigger) ||
      lower.includes(trigger.normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
  );
}
