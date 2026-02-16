export type Marco = "biblica" | "estoica" | "universal";

export interface Cita {
  source: string;
  text: string;
}

export const CITAS: Record<Marco, Cita[]> = {
  biblica: [
    { source: "Salmos 34:18", text: "Cercano esta el Senor a los quebrantados de corazon, y salva a los abatidos de espiritu." },
    { source: "Mateo 11:28-30", text: "Vengan a mi todos los que estan cansados y agobiados, y yo les dare descanso." },
    { source: "Isaias 43:2", text: "Cuando pases por las aguas, yo estare contigo; y si por los rios, no te anegaran." },
    { source: "Salmos 46:10", text: "Estad quietos, y conoced que yo soy Dios." },
    { source: "Romanos 8:28", text: "Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien." },
    { source: "Proverbios 3:5-6", text: "Confia en el Senor de todo tu corazon, y no te apoyes en tu propia prudencia." },
    { source: "Salmos 23:4", text: "Aunque ande en valle de sombra de muerte, no temere mal alguno, porque tu estaras conmigo." },
    { source: "Lamentaciones 3:22-23", text: "Por la misericordia del Senor no hemos sido consumidos, porque nunca decayeron sus misericordias; nuevas son cada manana." },
    { source: "Eclesiastes 3:1,4", text: "Todo tiene su tiempo. Tiempo de llorar, y tiempo de reir; tiempo de endechar, y tiempo de bailar." },
    { source: "2 Corintios 4:8-9", text: "Que estamos atribulados en todo, mas no angustiados; en apuros, mas no desesperados; derribados, pero no destruidos." },
  ],
  estoica: [
    { source: "Marco Aurelio, Meditaciones, Libro IV, \u00a73", text: "Tienes poder sobre tu mente, no sobre los eventos externos. Date cuenta de esto, y encontraras la fuerza." },
    { source: "Epicteto, Enquiridion, \u00a75", text: "No son las cosas las que perturban a los hombres, sino las opiniones que tienen de ellas." },
    { source: "Seneca, Cartas a Lucilio, 78.2", text: "A veces incluso vivir es un acto de coraje." },
    { source: "Marco Aurelio, Meditaciones, Libro VI, \u00a76", text: "La mejor venganza es no ser como tu enemigo." },
    { source: "Seneca, De la brevedad de la vida, \u00a71.3", text: "No es que tengamos poco tiempo, sino que perdemos mucho." },
    { source: "Epicteto, Disertaciones, I.1.1", text: "De todas las cosas que existen, unas dependen de nosotros, otras no dependen de nosotros." },
    { source: "Marco Aurelio, Meditaciones, Libro II, \u00a71", text: "Cuando te levantes por la manana, piensa en el precioso privilegio de estar vivo: de respirar, de pensar, de disfrutar, de amar." },
    { source: "Seneca, Cartas a Lucilio, 96.1", text: "La dificultad es lo que despierta al genio." },
    { source: "Marco Aurelio, Meditaciones, Libro VII, \u00a78", text: "Piensa en lo que tienes antes que en lo que te falta." },
    { source: "Seneca, De la providencia, \u00a74.6", text: "No hay arbol firme y robusto si el viento no lo azota con frecuencia." },
  ],
  universal: [
    { source: "Rumi, Masnavi", text: "La herida es el lugar por donde entra la luz." },
    { source: "Thich Nhat Hanh, Ser paz, cap. 1", text: "No hay camino hacia la paz. La paz es el camino." },
    { source: "Lao Tzu, Tao Te Ching, \u00a776", text: "Lo rigido y duro es companero de la muerte. Lo blando y flexible es companero de la vida." },
    { source: "Khalil Gibran, El Profeta, Del dolor", text: "Vuestro dolor es el rompimiento de la cascara que encierra vuestro entendimiento." },
    { source: "Buda, Dhammapada, \u00a71-2", text: "Somos lo que pensamos. Todo lo que somos surge con nuestros pensamientos." },
    { source: "Viktor Frankl, El hombre en busca de sentido, III", text: "Quien tiene un porque para vivir puede soportar casi cualquier como." },
    { source: "Eckhart Tolle, El poder del ahora, cap. 2", text: "Date cuenta profundamente de que el momento presente es todo lo que tienes." },
    { source: "Thomas Merton, Semillas de contemplacion, \u00a714", text: "No encontramos el sentido de la vida solos. Lo encontramos con otro." },
    { source: "Pema Chodron, Cuando todo se derrumba, cap. 1", text: "Nada se va hasta que nos ha ensenado lo que necesitamos saber." },
    { source: "Hermann Hesse, Siddhartha, cap. 12", text: "La sabiduria no es comunicable. El saber se puede transmitir, pero no la sabiduria." },
  ],
};

export const MARCOS: Record<Marco, { nombre: string; descripcion: string }> = {
  biblica: {
    nombre: "Tradicion biblica",
    descripcion: "Reflexion desde la sabiduria judeocristiana",
  },
  estoica: {
    nombre: "Filosofia clasica",
    descripcion: "Reflexion desde el estoicismo grecorromano",
  },
  universal: {
    nombre: "Espiritualidad universal",
    descripcion: "Reflexion desde diversas tradiciones de sabiduria",
  },
};
