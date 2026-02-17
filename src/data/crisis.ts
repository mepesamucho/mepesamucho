export const CRISIS_TRIGGERS = [
  // Suicidio — variaciones directas
  "suicid", "quitarme la vida", "no quiero vivir", "quiero morir", "quiero morirme",
  "me quiero morir", "me quiero matar", "quiero matarme", "voy a matarme",
  "me voy a matar", "mejor muerto", "mejor muerta",
  "ya no quiero estar aqui", "ya no quiero estar vivo", "ya no quiero estar viva",
  "ya no quiero seguir", "no vale la pena vivir", "acabar con todo",
  "terminar con todo", "ya no puedo mas", "no aguanto mas",
  "desaparecer del mundo", "ojala no existiera", "ojala estuviera muerto",
  "ojala estuviera muerta", "no quiero despertar", "no quiero seguir viviendo",
  "para que seguir", "para que vivir", "no tiene sentido vivir",
  "la vida no tiene sentido", "no le veo sentido a la vida",
  "quiero desaparecer", "quiero dejar de existir",
  "me quiero ir", "me quiero ir de este mundo",
  "ya no quiero nada", "todo seria mejor sin mi",
  "no deberia haber nacido", "ojala no hubiera nacido",
  "quiero acabar con esto", "quiero que todo termine",
  // Autolesion
  "cortarme", "me corto", "autolesion", "hacerme dano",
  "lastimarme", "herirme", "golpearme", "quemarme",
  "me hago dano", "me lastimo", "me hiero",
  // Muerte / desesperanza profunda
  "quiero estar muerto", "quiero estar muerta", "mejor sin mi",
  "mi familia estaria mejor sin mi", "todos estarian mejor sin mi",
  "nadie me necesita", "a nadie le importo", "no le importo a nadie",
  "soy una carga", "estorbo", "no sirvo para nada",
  "no merezco vivir", "no merezco estar aqui",
  "no valgo nada", "soy un fracaso total",
  // Adicciones en crisis
  "sobredosis", "me drogo", "no puedo dejar de tomar",
  "no puedo dejar de beber", "recai", "recaida",
  // Abuso
  "me pegan", "me golpean", "abuso", "me violan", "violencia",
  "me maltratan", "me abusan", "abuso sexual",
  // Metodos (detectar menciones de metodos)
  "pastillas para morir", "tirarme", "aventarme", "lanzarme",
  "colgarme", "ahorcarme", "envenenarme",
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
