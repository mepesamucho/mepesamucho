export type Marco = "biblica" | "estoica" | "universal";

export interface Cita {
  source: string;
  text: string;
}

// La clave "estoica" se conserva por compatibilidad, pero el corpus ahora abarca
// toda la filosofía clásica: estoicismo, aristotelismo, platonismo, epicureísmo,
// cinismo, escepticismo y presocráticos. El modelo elige la voz que mejor
// resuene con lo que el usuario trae.
//
// La clave "universal" agrupa sabiduría contemplativa de oriente y occidente
// junto a psicología humanista, existencial y contemporánea, para que la
// reflexión explore muchos caminos distintos y no se sienta repetitiva.

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
    { source: "Salmos 139:7-10", text: "¿A dónde me iré de tu espíritu? Si subiere a los cielos, allí estás tú; y si en el Seol hiciere mi estrado, he aquí, allí tú estás." },
    { source: "Filipenses 4:6-7", text: "Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias." },
    { source: "Juan 14:27", text: "La paz os dejo, mi paz os doy; no os la doy como el mundo la da. No se turbe vuestro corazón, ni tenga miedo." },
    { source: "Salmos 30:5", text: "Por la noche durará el lloro, y a la mañana vendrá la alegría." },
    { source: "Romanos 5:3-4", text: "La tribulación produce paciencia; y la paciencia, prueba; y la prueba, esperanza." },
  ],
  // Filosofía clásica (amplia: estoicos, Aristóteles, Platón, Epicuro, cínicos,
  // escépticos, presocráticos). El modelo debe elegir la cita cuya voz mejor
  // encaje con lo que el usuario necesita.
  estoica: [
    // Estoicismo
    { source: "Marco Aurelio, Meditaciones, IV, §3", text: "Tienes poder sobre tu mente, no sobre los eventos externos. Date cuenta de esto, y encontrarás la fuerza." },
    { source: "Epicteto, Enquiridión, §5", text: "No son las cosas las que perturban a los hombres, sino las opiniones que tienen de ellas." },
    { source: "Séneca, Cartas a Lucilio, 78.2", text: "A veces incluso vivir es un acto de coraje." },
    { source: "Marco Aurelio, Meditaciones, VI, §6", text: "La mejor venganza es no ser como tu enemigo." },
    { source: "Séneca, De la brevedad de la vida, §1.3", text: "No es que tengamos poco tiempo, sino que perdemos mucho." },
    { source: "Epicteto, Disertaciones, I.1.1", text: "De todas las cosas que existen, unas dependen de nosotros, otras no dependen de nosotros." },
    { source: "Marco Aurelio, Meditaciones, II, §1", text: "Cuando te levantes por la mañana, piensa en el precioso privilegio de estar vivo: de respirar, de pensar, de disfrutar, de amar." },
    { source: "Séneca, De la providencia, §4.6", text: "No hay árbol firme y robusto si el viento no lo azota con frecuencia." },

    // Aristotelismo
    { source: "Aristóteles, Ética a Nicómaco, II, 1", text: "Somos lo que hacemos repetidamente. La excelencia, entonces, no es un acto, sino un hábito." },
    { source: "Aristóteles, Ética a Nicómaco, I, 13", text: "Conocerse a uno mismo es el principio de toda sabiduría." },
    { source: "Aristóteles, Ética a Nicómaco, IX, 9", text: "La amistad es un alma que habita en dos cuerpos." },
    { source: "Aristóteles, Ética a Nicómaco, VII, 14", text: "La felicidad depende de nosotros mismos más que de nadie." },

    // Platonismo / Sócrates
    { source: "Platón, Apología de Sócrates, 38a", text: "Una vida no examinada no merece ser vivida." },
    { source: "Platón, Fedón, 67a", text: "El alma toma el color de sus pensamientos." },
    { source: "Sócrates (en Platón, Apología, 21d)", text: "Solo sé que no sé nada." },
    { source: "Platón, La República, VII, 518d", text: "La luz no se da al ojo que no la busca." },

    // Epicureísmo
    { source: "Epicuro, Carta a Meneceo, §125", text: "No estropees lo que tienes deseando lo que no tienes; recuerda que lo que ahora tienes fue alguna vez parte de lo que solo esperabas." },
    { source: "Epicuro, Máximas Capitales, IV", text: "El dolor intenso no dura mucho en la carne; el dolor prolongado, por leve, es soportable." },
    { source: "Epicuro, Sentencias Vaticanas, §14", text: "Hemos nacido una sola vez; dos no se puede. Y ya no seremos por toda la eternidad." },

    // Cinismo
    { source: "Diógenes de Sinope (en Diógenes Laercio, VI)", text: "El sol también entra en las letrinas y no se mancha." },
    { source: "Crates de Tebas (en Diógenes Laercio, VI, 86)", text: "No dejes de estudiar por temor a equivocarte; el error es parte del aprendizaje." },

    // Escepticismo
    { source: "Pirrón (en Sexto Empírico, Esbozos pirrónicos, I, 8)", text: "Suspender el juicio es el camino hacia la serenidad del alma." },

    // Presocráticos
    { source: "Heráclito, Fragmento 91 (DK)", text: "Ningún hombre se baña dos veces en el mismo río, porque no es el mismo río ni es el mismo hombre." },
    { source: "Heráclito, Fragmento 123 (DK)", text: "La naturaleza gusta de ocultarse." },
    { source: "Empédocles, Fragmento 17 (DK)", text: "Lo que existe tiende a unirse con lo semejante; lo semejante busca a lo semejante." },
    { source: "Anaximandro (en Simplicio, Física, 24.13)", text: "Todo cuanto existe paga unas a otras pena y retribución por su injusticia, según el orden del tiempo." },

    // Neoplatonismo y romanos tardíos
    { source: "Plotino, Enéadas, I, 6, 9", text: "Regresa a ti mismo y mira: si no te ves aún hermoso, haz como el escultor: quita lo superfluo, pule lo áspero." },
    { source: "Cicerón, Tusculanas, III, 28", text: "El sabio no solo no teme a la muerte, sino que, cuando llega, la recibe tranquilamente." },
    { source: "Boecio, Consolación de la filosofía, II, 4", text: "Nada es desgraciado sino lo que tú juzgas como tal; y, al contrario, toda suerte es feliz para el que la sobrelleva con ánimo sereno." },
  ],
  // Espiritualidad universal + psicología (humanista, existencial, contemporánea).
  // Explorar muchos caminos: contemplativo oriental y occidental, mística,
  // psicología profunda, psicología humanista, ACT, Gestalt, ciencia contemplativa.
  universal: [
    // Sabiduría contemplativa
    { source: "Rumi, Masnavi", text: "La herida es el lugar por donde entra la luz." },
    { source: "Thich Nhat Hanh, Ser paz, cap. 1", text: "No hay camino hacia la paz. La paz es el camino." },
    { source: "Lao Tzu, Tao Te Ching, §76", text: "Lo rígido y duro es compañero de la muerte. Lo blando y flexible es compañero de la vida." },
    { source: "Lao Tzu, Tao Te Ching, §33", text: "Conocer a los demás es inteligencia; conocerse a sí mismo es verdadera sabiduría." },
    { source: "Khalil Gibrán, El Profeta, Del dolor", text: "Vuestro dolor es el rompimiento de la cáscara que encierra vuestro entendimiento." },
    { source: "Buda, Dhammapada, §1-2", text: "Somos lo que pensamos. Todo lo que somos surge con nuestros pensamientos." },
    { source: "Buda, Dhammapada, §223", text: "Vence a la ira con la calma, al mal con el bien, a la avaricia con la generosidad, a la mentira con la verdad." },
    { source: "Chuang Tzu, Libro Interior, II", text: "El hombre perfecto usa su mente como un espejo: no retiene nada, no rechaza nada; recibe, pero no guarda." },
    { source: "Hafiz, El don", text: "Algún día tu corazón te llevará a tu amante. Algún día tu alma te llevará al Amado." },
    { source: "Meister Eckhart, Sermón 52", text: "Dios no está en el ruido; Dios está en el silencio del alma." },
    { source: "Teresa de Ávila, Las Moradas, Primeras, I", text: "Nada te turbe, nada te espante; todo se pasa." },

    // Existencialismo y sentido
    { source: "Viktor Frankl, El hombre en busca de sentido, III", text: "Quien tiene un porqué para vivir puede soportar casi cualquier cómo." },
    { source: "Viktor Frankl, El hombre en busca de sentido, II", text: "Entre el estímulo y la respuesta hay un espacio. En ese espacio está nuestro poder de elegir nuestra respuesta." },
    { source: "Søren Kierkegaard, Diarios, 1843", text: "La vida solo puede entenderse mirando hacia atrás, pero debe vivirse mirando hacia adelante." },
    { source: "Rollo May, El hombre en busca de sí mismo, cap. 6", text: "La libertad es la capacidad humana de hacer una pausa entre el estímulo y la respuesta." },

    // Psicología profunda (Jung y sucesores)
    { source: "Carl Jung, Respuesta a Job, §758", text: "No hay despertar de la conciencia sin dolor." },
    { source: "Carl Jung, Obras Completas, IX, §14", text: "Lo que no se hace consciente se manifiesta en nuestras vidas como destino." },
    { source: "James Hillman, El código del alma, cap. 1", text: "El carácter se forma cuando nos atrevemos a aceptar la invitación del alma." },

    // Psicología humanista
    { source: "Carl Rogers, El proceso de convertirse en persona, cap. 2", text: "La curiosa paradoja es que cuando me acepto tal como soy, entonces puedo cambiar." },
    { source: "Abraham Maslow, El hombre autorrealizado, cap. 3", text: "Lo que un hombre puede ser, debe serlo. A esta necesidad la llamamos autorrealización." },
    { source: "Fritz Perls, Terapia Gestalt, §1", text: "Pierde la mente y llega a los sentidos." },

    // Mindfulness y psicología contemporánea
    { source: "Jon Kabat-Zinn, Vivir con plenitud las crisis, cap. 1", text: "No puedes detener las olas, pero puedes aprender a surfear." },
    { source: "Pema Chödrön, Cuando todo se derrumba, cap. 1", text: "Nada se va hasta que nos ha enseñado lo que necesitamos saber." },
    { source: "Pema Chödrön, Los lugares que te asustan, cap. 4", text: "Solo en la medida en que nos exponemos una y otra vez a la aniquilación, puede encontrarse dentro de nosotros aquello que es indestructible." },
    { source: "Tara Brach, Aceptación radical, cap. 2", text: "El momento en que aceptas plenamente lo que eres, es el momento en que te abres a la sanación." },
    { source: "Brené Brown, Los dones de la imperfección, cap. 1", text: "Solo cuando somos lo bastante valientes para explorar la oscuridad, descubrimos el poder infinito de nuestra luz." },

    // ACT y psicología del sufrimiento
    { source: "Steven Hayes, Sal de tu mente, entra en tu vida, cap. 4", text: "El dolor es inevitable; el sufrimiento es opcional cuando aprendemos a dejar de luchar con lo que no podemos controlar." },

    // Viktor Frankl adicional y contemplativos contemporáneos
    { source: "Eckhart Tolle, El poder del ahora, cap. 2", text: "Date cuenta profundamente de que el momento presente es todo lo que tienes." },
    { source: "Thomas Merton, Semillas de contemplación, §14", text: "No encontramos el sentido de la vida solos. Lo encontramos con otro." },
    { source: "Hermann Hesse, Siddhartha, cap. 12", text: "La sabiduría no es comunicable. El saber se puede transmitir, pero no la sabiduría." },
    { source: "Mary Oliver, Wild Geese", text: "No tienes que ser bueno. Solo tienes que dejar que la suave criatura de tu cuerpo ame lo que ama." },
    { source: "Rainer Maria Rilke, Cartas a un joven poeta, IV", text: "Ten paciencia con todo lo que está sin resolver en tu corazón, y trata de amar las preguntas mismas." },
  ],
};

export const MARCOS: Record<Marco, { nombre: string; descripcion: string }> = {
  biblica: {
    nombre: "Tradición bíblica",
    descripcion: "Reflexión desde la sabiduría judeocristiana",
  },
  estoica: {
    nombre: "Filosofía clásica",
    descripcion: "Reflexión desde la filosofía grecorromana (estoicos, Aristóteles, Platón, Epicuro y más)",
  },
  universal: {
    nombre: "Espiritualidad y psicología",
    descripcion: "Reflexión desde tradiciones contemplativas y psicología humanista, existencial y contemporánea",
  },
};
