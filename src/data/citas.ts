export type Marco = "biblica" | "estoica" | "universal";

export interface Cita {
  source: string;
  text: string;
}

export const CITAS: Record<Marco, Cita[]> = {
  biblica: [
    { source: "Salmos 34:18", text: "Cercano está el Señor a los quebrantados de corazón, y salva a los abatidos de espíritu." },
    { source: "Mateo 11:28-30", text: "Vengan a mí todos los que están cansados y agobiados, y yo les daré descanso." },
    { source: "Isaías 43:2", text: "Cuando pases por las aguas, yo estaré contigo; y si por los ríos, no te anegarán." },
    { source: "Salmos 46:10", text: "Estad quietos, y conoced que yo soy Dios." },
    { source: "Romanos 8:28", text: "Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien." },
    { source: "Proverbios 3:5-6", text: "Confía en el Señor de todo tu corazón, y no te apoyes en tu propia prudencia." },
    { source: "Salmos 23:4", text: "Aunque ande en valle de sombra de muerte, no temeré mal alguno, porque tú estarás conmigo." },
    { source: "Lamentaciones 3:22-23", text: "Por la misericordia del Señor no hemos sido consumidos, porque nunca decayeron sus misericordias; nuevas son cada mañana." },
    { source: "Eclesiastés 3:1,4", text: "Todo tiene su tiempo. Tiempo de llorar, y tiempo de reír; tiempo de endechar, y tiempo de bailar." },
    { source: "2 Corintios 4:8-9", text: "Que estamos atribulados en todo, mas no angustiados; en apuros, mas no desesperados; derribados, pero no destruidos." },
  ],
  estoica: [
    { source: "Marco Aurelio, Meditaciones, Libro IV, §3", text: "Tienes poder sobre tu mente, no sobre los eventos externos. Date cuenta de esto, y encontrarás la fuerza." },
    { source: "Epicteto, Enquiridión, §5", text: "No son las cosas las que perturban a los hombres, sino las opiniones que tienen de ellas." },
    { source: "Séneca, Cartas a Lucilio, 78.2", text: "A veces incluso vivir es un acto de coraje." },
    { source: "Marco Aurelio, Meditaciones, Libro VI, §6", text: "La mejor venganza es no ser como tu enemigo." },
    { source: "Séneca, De la brevedad de la vida, §1.3", text: "No es que tengamos poco tiempo, sino que perdemos mucho." },
    { source: "Epicteto, Disertaciones, I.1.1", text: "De todas las cosas que existen, unas dependen de nosotros, otras no dependen de nosotros." },
    { source: "Marco Aurelio, Meditaciones, Libro II, §1", text: "Cuando te levantes por la mañana, piensa en el precioso privilegio de estar vivo: de respirar, de pensar, de disfrutar, de amar." },
    { source: "Séneca, Cartas a Lucilio, 96.1", text: "La dificultad es lo que despierta al genio." },
    { source: "Marco Aurelio, Meditaciones, Libro VII, §8", text: "Piensa en lo que tienes antes que en lo que te falta." },
    { source: "Séneca, De la providencia, §4.6", text: "No hay árbol firme y robusto si el viento no lo azota con frecuencia." },
  ],
  universal: [
    { source: "Rumi, Masnavi", text: "La herida es el lugar por donde entra la luz." },
    { source: "Thich Nhat Hanh, Ser paz, cap. 1", text: "No hay camino hacia la paz. La paz es el camino." },
    { source: "Lao Tzu, Tao Te Ching, §76", text: "Lo rígido y duro es compañero de la muerte. Lo blando y flexible es compañero de la vida." },
    { source: "Khalil Gibrán, El Profeta, Del dolor", text: "Vuestro dolor es el rompimiento de la cáscara que encierra vuestro entendimiento." },
    { source: "Buda, Dhammapada, §1-2", text: "Somos lo que pensamos. Todo lo que somos surge con nuestros pensamientos." },
    { source: "Viktor Frankl, El hombre en busca de sentido, III", text: "Quien tiene un porqué para vivir puede soportar casi cualquier cómo." },
    { source: "Eckhart Tolle, El poder del ahora, cap. 2", text: "Date cuenta profundamente de que el momento presente es todo lo que tienes." },
    { source: "Thomas Merton, Semillas de contemplación, §14", text: "No encontramos el sentido de la vida solos. Lo encontramos con otro." },
    { source: "Pema Chödrön, Cuando todo se derrumba, cap. 1", text: "Nada se va hasta que nos ha enseñado lo que necesitamos saber." },
    { source: "Hermann Hesse, Siddhartha, cap. 12", text: "La sabiduría no es comunicable. El saber se puede transmitir, pero no la sabiduría." },
  ],
};

export const MARCOS: Record<Marco, { nombre: string; descripcion: string }> = {
  biblica: {
    nombre: "Tradición bíblica",
    descripcion: "Reflexión desde la sabiduría judeocristiana",
  },
  estoica: {
    nombre: "Filosofía clásica",
    descripcion: "Reflexión desde el estoicismo grecorromano",
  },
  universal: {
    nombre: "Espiritualidad universal",
    descripcion: "Reflexión desde diversas tradiciones de sabiduría",
  },
};
