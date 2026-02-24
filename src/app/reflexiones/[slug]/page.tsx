import type { Metadata } from "next";
import Link from "next/link";

interface Props {
  params: {
    slug: string;
  };
}

const ARTICULOS = {
  "que-hacer-cuando-todo-te-pesa": {
    titulo: "¿Qué hacer cuando todo te pesa? 5 formas de soltar la carga emocional",
    descripcion:
      "Aprende cinco estrategias concretas para aliviar el peso emocional y encontrar claridad cuando la carga se siente insoportable.",
    keywords: "soltar carga emocional, bienestar emocional, reflexión personal",
    contenido: `
      <p>
        Hay momentos en la vida donde la carga emocional se siente tan pesada que incluso respirar parece un esfuerzo. El peso no es físico, pero es tan real como cualquier cosa que pudieras cargar en tus brazos. Ese sentimiento de que todo te aplasta, de que no puedes más, es una señal de que necesitas soltar algo.
      </p>

      <p>
        La buena noticia es que soltar no sucede de una sola vez. Es un proceso, a menudo lento, pero profundamente sanador. A continuación, te comparto cinco formas concretas de empezar a aligerar esa carga que llevas.
      </p>

      <h2>1. Nombra lo que carries</h2>
      <p>
        Antes de poder soltar algo, necesitas saber qué es. Muchas personas viven con una sensación vaga de pesadez sin realmente identificar qué las aplasta. Tómate tiempo para escribir: ¿Qué específicamente te pesa? ¿Es una relación? ¿Un fracaso? ¿La expectativa de ser perfecto? ¿El miedo al futuro?
      </p>

      <p>
        El simple acto de nombrar tiene poder. Transforma lo vago en algo concreto, y lo concreto se puede trabajar. Cuando sabes exactamente qué llevas, dejas de luchar contra una sombra.
      </p>

      <h2>2. Permitete sentir sin juzgar</h2>
      <p>
        Muchos de nosotros aprendimos desde pequeños a reprimir lo que sentimos. «No llores», «sé fuerte», «otros tienen problemas peores». Este rechazo a nuestras emociones las hace más pesadas, no más ligeras. La emoción rechazada se enquista. Se vuelve crónica.
      </p>

      <p>
        Soltar comienza cuando das permiso: permiso para estar triste, permiso para estar enfadado, permiso para estar asustado. No necesitas actuar sobre la emoción. Solo necesitas sentirla. Aquí es donde la escritura, el llanto, la conversación honesta juegan un papel crucial. Siente, expresa, y luego observa cómo la intensidad disminuye naturalmente.
      </p>

      <h2>3. Distingue entre lo que puedes y no puedes controlar</h2>
      <p>
        Una parte importante del peso que llevamos viene de intentar controlar cosas que están fuera de nuestro alcance. El pasado ya sucedió. Las decisiones de otras personas no son tuyas. El futuro aún no llega. Gastar energía en controlar lo incontrolable es como arrojar agua a un fuego que no existe.
      </p>

      <p>
        Identifica qué está dentro de tu poder: tus acciones presentes, tu intención, tu esfuerzo, tu amabilidad. Enfoca allí. Lo demás, déjalo ir. Esta distinción, aunque simple, es transformadora.
      </p>

      <h2>4. Practica el perdón (especialmente contigo mismo)</h2>
      <p>
        Muchas personas cargan culpa por años. Culpa por lo que dijeron, lo que no dijeron, lo que hicieron, lo que no hicieron. El arrepentimiento sincero es importante, pero la culpa infinita es una prisión que construyes para ti mismo.
      </p>

      <p>
        El perdón no significa que lo ocurrido estuvo bien. Significa que decidiste no dejar que defina tu presente. Empieza por perdonarte a ti mismo. Reconoce que hiciste lo mejor que pudiste con lo que sabías en ese momento. Aprende, y luego suelta. Tu futuro no tiene que estar hipotecado por tu pasado.
      </p>

      <h2>5. Construye nuevos rituales de ligereza</h2>
      <p>
        Finalmente, soltar no es solo sobre dejar ir lo viejo. Es también sobre traer lo nuevo. Crear rituales pequeños que refuercen tu intención de estar más ligero: una caminata donde simplemente observas sin pensar, una práctica de gratitud donde reconoces lo que sí tienes, un momento cada día donde te permites estar en paz.
      </p>

      <p>
        Estos rituales no son magia, pero son consistencia. Y la consistencia es lo que transforma una intención en una realidad vivida.
      </p>

      <h2>El viaje hacia la ligereza</h2>
      <p>
        Soltar la carga emocional es un viaje, no un destino. Habrá días donde sientas que has avanzado, y días donde la carga reaparece. Eso es normal. Lo importante es que ahora sabes que puedes hacer algo al respecto. Que tienes herramientas. Que no estás condenado a cargar indefinidamente.
      </p>

      <p>
        Empieza hoy, pequeño paso a pequeño paso. Nombra tu carga, siéntela, distingue lo que controlas, perdónate, y construye rituales de ligereza. La carga que llevas no es permanente. Está esperando a que la sueltes.
      </p>
    `,
  },
  "el-poder-de-escribir-lo-que-sientes": {
    titulo: "El poder de escribir lo que sientes — Por qué el journaling cambia tu vida",
    descripcion:
      "Descubre cómo la escritura terapéutica puede transformar tus emociones, sanar heridas y conectarte con tu sabiduría interior.",
    keywords: "journaling, escritura terapéutica, desahogo emocional",
    contenido: `
      <p>
        Existe una magia en la escritura que pocas personas descubren. No me refiero a escribir para ser publicado, o para impresionar a alguien. Me refiero a esa escritura cruda, honesta, donde vacias tu corazón en la página sin censura ni perfección. Esa es la escritura que cambia vidas.
      </p>

      <p>
        Cuando escribes lo que sientes, algo profundo sucede. Lo que estaba atrapado en tu pecho, circulando en tu mente, causando ansiedad, de repente tiene forma. Tiene palabras. Tiene espacio en el mundo fuera de ti. Y de alguna manera, eso te libera.
      </p>

      <h2>¿Por qué escribir es diferente a solo pensar?</h2>
      <p>
        Tu mente es como una habitación cerrada donde los pensamientos rebotan sin dirección. Pueden ser contradictorios, confusos, repetitivos. Pero cuando escribes, obligas a tu mente a organizar. Tienes que elegir palabras. Tienes que contar una historia. La página se convierte en un espejo donde ves con claridad lo que realmente sientes.
      </p>

      <p>
        La neurociencia lo confirma: escribir activa diferentes partes del cerebro que el pensamiento pasivo. Integras ambos hemisferios cerebrales. Procesas emociones de manera más profunda. Literalmente reorganizas tu mente cuando escribes.
      </p>

      <h2>El journaling como herramienta de sanación</h2>
      <p>
        Cuando guardas silencio sobre tus heridas, ellas siguen viviendo adentro. Se infectan. Se convierten en rabia reprimida, ansiedad crónica, depresión silenciosa. Pero cuando escribes sobre lo que te duele, estás haciendo un acto de valentía. Estás diciendo: "Este dolor existe. Es mío. Y voy a enfrentarlo."
      </p>

      <p>
        El journaling no resuelve el problema, pero te permite verlo desde nuevos ángulos. A menudo, mientras escribes sobre una dificultad, tu propia sabiduría emerge. Comienzas a escribir una pregunta, y la respuesta aparece en la página como si saliera de alguien más. Porque tu inconsciente ya sabe. Solo necesitaba espacio para hablar.
      </p>

      <h2>Cómo empezar tu práctica de escritura</h2>
      <p>
        No necesitas nada especial. Un cuaderno, un bolígrafo, quince minutos. Sin filtros. Sin preocupación por ortografía o que tenga sentido. Si necesitas maldecir, maldice. Si necesitas repetir lo mismo diez veces, hazlo. Esta es una conversación privada contigo mismo.
      </p>

      <p>
        Algunas personas escriben por la mañana para clarificar el día. Otras por la noche para procesar lo vivido. Algunos usan preguntas como disparadores: "¿Qué necesito soltar?" "¿De qué tengo miedo?" "¿Cuál es la verdad que no me atrevo a decir?" La pregunta abre la puerta; la escritura es lo que camina a través.
      </p>

      <h2>El acto de dejar ir a través de la palabra</h2>
      <p>
        Hay poder en escribir algo negativo y luego decidir qué hacer con ello. Algunos queman sus páginas. Otros las guardan y las releen meses después para ver cuánto han crecido. Algunos las rompen, como un ritual de cierre. No importa qué hagas, el acto de escribir ya hizo su trabajo. La emoción salió de ti y entró en el mundo.
      </p>

      <h2>Escritura como diálogo contigo mismo</h2>
      <p>
        Una práctica poderosa es escribir una pregunta, luego responderla desde diferentes perspectivas. Tu parte herida responde. Tu parte sabia responde. La persona que quieres ser responde. De repente, esas voces internas que compiten por tu atención tienen espacio. Se escuchan entre sí. Y a menudo, alcanzan un entendimiento.
      </p>

      <h2>El regalo acumulativo</h2>
      <p>
        Si practicas esto durante semanas, meses, años, algo extraordinario sucede. Tienes un registro de tu propia evolución. Ves patrones que no notabas. Reconoces que ya superaste cosas que parecían insuperables. La página se convierte en tu testigo, tu consejera, tu mejor amiga.
      </p>

      <p>
        La escritura te devuelve a ti mismo. En un mundo que constantemente quiere tu atención, tu dinero, tu aprobación, el journaling es un acto revolucionario de auto-cuidado. Es decir: "Mis sentimientos importan. Mi voz importa. Merezco ser escuchado, al menos por mí mismo."
      </p>

      <p>
        Así que toma un cuaderno. Escribe lo que sientes. No importa si es bonito o perfecto. Importa que sea verdadero. Porque en esa verdad, en esa honestidad cruda, es donde comienza la sanación.
      </p>
    `,
  },
  "frases-estoicas-para-momentos-dificiles": {
    titulo: "10 frases estoicas para momentos difíciles — Sabiduría que transforma",
    descripcion:
      "Encuentra sabiduría atemporal de Séneca y Marco Aurelio para enfrentar los desafíos con serenidad y propósito.",
    keywords: "frases estoicas, estoicismo, filosofía para la vida, Séneca, Marco Aurelio",
    contenido: `
      <p>
        El estoicismo no es una filosofía para los insensibles. Es una filosofía para los que sufren. Fue practicada por un emperador en la batalla (Marco Aurelio), un ex esclavo en cadenas (Epicteto), un millonario que perdió todo (Séneca). Hombres que enfrentaron lo peor de la vida humana y encontraron paz, no a través de negar el sufrimiento, sino a través de entenderlo.
      </p>

      <p>
        Aquí están diez frases estoicas que pueden transformar cómo enfrentas tus propios desafíos:
      </p>

      <h2>1. "No son las cosas las que nos turban, sino nuestras opiniones sobre ellas" — Epicteto</h2>
      <p>
        Esta es la frase más poderosa del estoicismo. No puedes controlar lo que sucede, pero puedes controlar cómo lo interpretas. Alguien te critica. El evento es neutral. Tu opinión sobre ti mismo en respuesta a esa crítica es lo que causa sufrimiento o paz. Cambiar tu perspectiva es cambiar tu realidad.
      </p>

      <h2>2. "No busques que las cosas sucedan como deseas, sino deséalas como suceden" — Epicteto</h2>
      <p>
        La aceptación no es resignación. Es inteligencia. La vida rara vez se ajusta a nuestros planes. Alguien sabio dice: "Bien, así es entonces. ¿Qué puedo aprender? ¿Qué puedo hacer ahora?" Esto te ahorra el sufrimiento de luchar contra la realidad.
      </p>

      <h2>3. "Tienes poder sobre tu mente, no sobre los eventos externos. Date cuenta de esto, y encontrarás fuerza" — Marco Aurelio</h2>
      <p>
        Esta es la pregunta más importante que puedes hacerte en una crisis: "¿Sobre qué tengo control aquí?" No sobre el mercado, no sobre la enfermedad, no sobre lo que otros piensan. Pero sí sobre tu respuesta, tu esfuerzo, tu carácter. Enfoca allí.
      </p>

      <h2>4. "Somos impresionados no por los eventos, sino por cómo los juzgamos" — Séneca</h2>
      <p>
        Un perdedor ve un fracaso y se ve a sí mismo como fracaso. Un aprendiz ve el mismo evento y extrae la lección. La diferencia no está en el evento. Está en el juicio. Los estoicos eran maestros en cambiar cómo juzgaban lo que sucedía.
      </p>

      <h2>5. "La enfermedad es un impedimento del cuerpo, pero no del propósito, a menos que el propósito mismo lo permita" — Marco Aurelio</h2>
      <p>
        Enfermedad, desempleo, pérdida. Sí, estos son obstáculos reales. Pero no para tu valor como persona. No para tu capacidad de ser honrado, de amar, de pensar claramente. Los estoicos distinguían entre lo que es un verdadero obstáculo y lo que es solo una molestia.
      </p>

      <h2>6. "No basta con tener buenas intenciones; debes vigilar tus palabras y acciones, porque estas son las que te definen" — Séneca</h2>
      <p>
        Eres lo que haces repetidamente. No eres lo que piensas, o lo que sientes, o lo que pretender ser en público. Eres los pequeños actos, día tras día. Los estoicos enfatizaban la responsabilidad radical por tus acciones.
      </p>

      <h2>7. "Si deseas mejorar, prepárate para ser considerado estúpido respecto a las cosas externas" — Epicteto</h2>
      <p>
        Si quieres vivir bien, no puedes vivir para la opinión de otros. Debes parecer "loco" para los que valoran dinero, estatus, lujos. Los estoicos sabían que la paz requiere independencia de la aprobación externa.
      </p>

      <h2>8. "Algunas cosas están en nuestro control, otras no. En nuestro control están nuestras opiniones, impulsos, deseos y aversiones — en general, lo que es de nuestro propio hacer" — Epicteto</h2>
      <p>
        Esta es la frase que resume toda la filosofía. Memorízala. Úsala cuando estés ansioso. La ansiedad viene de preocuparse por cosas fuera de tu control. Cuando reconoces qué es realmente tuyo, la ansiedad desaparece.
      </p>

      <h2>9. "La clave es no estar ocupado, sino de estar ocupado en cosas que importan" — Séneca</h2>
      <p>
        Muchos confunden actividad con propósito. Estamos tan ocupados que nunca preguntamos: "¿Importa esto realmente?" Los estoicos eran intencionales. Cada acción servía a un propósito más grande.
      </p>

      <h2>10. "La muerte sonríe a todos los hombres; todo lo que un hombre puede hacer es sonreír de vuelta" — Marco Aurelio</h2>
      <p>
        No es morboso pensar en la muerte. Es liberador. Cuando reconoces que tu tiempo es limitado, las pequeñas molestias parecen menos importantes. Qué privilegio estar vivo ahora, en este día. Los estoicos no temían la muerte; la usaban como maestra para vivir mejor.
      </p>

      <h2>La práctica estoica</h2>
      <p>
        Estas frases no son para hacer sentir bien momentáneamente. Son para practicar. Cuando estés en dificultad, pregúntate: ¿Sobre qué tengo control? ¿Cómo puedo juzgar esto diferente? ¿Qué puedo aprender? Con el tiempo, estos principios se convierten en tu segundo instinto. Y cuando eso sucede, los desafíos de la vida pierden poder sobre ti.
      </p>

      <p>
        El estoicismo es un entrenamiento. Y como todo entrenamiento, funciona solo si lo practicas.
      </p>
    `,
  },
  "como-encontrar-paz-interior": {
    titulo: "Cómo encontrar paz interior — Una guía de reflexión contemplativa",
    descripcion:
      "Explora prácticas de meditación y reflexión contemplativa para cultivar la paz que busca tu corazón.",
    keywords: "paz interior, meditación, reflexión contemplativa",
    contenido: `
      <p>
        La paz interior no es algo que encuentres en un lugar, ni algo que compres, ni algo que suceda por accidente. Es algo que cultivas. Como un jardín, requiere consistencia, atención, paciencia. Y como un jardín, siempre está siendo invadido por maleza. La paz no es el destino final; es la práctica misma.
      </p>

      <h2>Entiende qué es la paz interior</h2>
      <p>
        Primero, aclaremos qué no es. No es la ausencia de problemas. No es la evasión del dolor. No es estar feliz todo el tiempo. La paz interior es una estabilidad fundamental, una sensación de que está bien estar aquí, ahora, incluso si las cosas no son perfectas. Es confiar en ti mismo y en la vida, incluso en medio de la incertidumbre.
      </p>

      <p>
        La paz es lo opuesto a la fragmentación. Es cuando tu mente, tu cuerpo y tu corazón no están en guerra interna. Es cuando actúas alineado con tus valores. Es cuando dejas de luchar contra lo que es y comienzas a trabajar con ello.
      </p>

      <h2>Comienza donde estás: observación sin juzgar</h2>
      <p>
        Antes de cultivar paz, necesitas saber cuál es tu estado actual. Tómate un momento para observarte sin juzgar. ¿Estás ansioso? ¿Irritable? ¿Adormecido? ¿Conectado? No necesitas cambiar nada todavía. Solo observa. Esta observación amable es el primer paso.
      </p>

      <p>
        La mayoría pasamos la vida totalmente inconscientes de nuestro estado interno. Reaccionamos automáticamente. Un día buscamos paz, otro buscamos adrenalina, otro buscamos distracción. La observación consciente te permite salir del piloto automático.
      </p>

      <h2>La práctica de la meditación contemplativa</h2>
      <p>
        No necesitas un templo, una vela ni música especial. Solo necesitas quietud y atención. Siéntate cómodamente. Respira naturalmente. Y observa. Observa tus pensamientos como si fueran nubes pasando por el cielo. No intentas detenerlos, ni controlarlos, ni creer en ellos. Solo observas.
      </p>

      <p>
        Al principio, tu mente será una tormenta de ruido. Está bien. Con la práctica, los espacios entre pensamientos se hacen más amplios. En esos espacios, encuentras paz. No la paz del vacío, sino la paz de estar simplemente aquí, sin lucha.
      </p>

      <p>
        Quince minutos al día es suficiente. La consistencia importa más que la duración. Una persona que medita quince minutos diarios durante un año experimentará cambios profundos. Una persona que intenta meditación una vez cada seis meses no experimentará nada.
      </p>

      <h2>Reflexión contemplativa: preguntas para el silencio</h2>
      <p>
        Otra práctica es la reflexión contemplativa. Después de meditar, siéntate en silencio con una pregunta. No intentes responder. Solo sostén la pregunta: "¿Qué necesito soltar?" "¿Quién quiero ser?" "¿Cuál es la verdad que mi corazón conoce?" Las respuestas vienen no del pensamiento, sino de un lugar más profundo. Escúchalas.
      </p>

      <h2>Cultiva la aceptación del momento presente</h2>
      <p>
        Mucho de nuestro malestar viene de vivir en el pasado (arrepentimiento, culpa) o en el futuro (ansiedad, anticipación). El presente es el único lugar donde la paz es posible. Tu respiración está aquí. Tu cuerpo está aquí. La vida está aquí.
      </p>

      <p>
        Una práctica simple: durante el día, pausa tres veces. Nota cinco cosas que ves, cuatro que tocas, tres que escuchas, dos que hueles, una que pruebas. Este anclaje sensorial te devuelve al presente. Y en el presente, sin historia que la acompañe, la vida es simplemente como es. Ese es el espacio de la paz.
      </p>

      <h2>Elimina lo que roba tu paz</h2>
      <p>
        La paz no solo se cultiva; también se protege. Identifica qué consume tu paz. ¿Son las redes sociales? ¿Ciertas personas? ¿Ciertos lugares? No necesitas juzgar. Solo necesitas ser honesto. Y luego, hacer cambios. Menos redes sociales, más naturaleza. Menos chismes, más conexiones significativas.
      </p>

      <h2>La paz de la integridad</h2>
      <p>
        No puedes tener paz interior si vives de manera incoherente con tus valores. Si dices que amas a alguien pero los tratas mal, hay conflicto. Si dices que quieres ser saludable pero no cuidas tu cuerpo, hay fricción. La paz requiere alineación.
      </p>

      <p>
        Pregúntate: ¿Dónde no estoy siendo honesto? ¿Dónde no estoy viviendo mis valores? Luego, pequeño paso a pequeño paso, alinéate. No necesita ser perfecto. Solo más honesto.
      </p>

      <h2>La paz de soltar</h2>
      <p>
        Finalmente, la paz viene cuando dejas ir la idea de que necesitas controlarlo todo. Tu cuerpo está envejeciendo. Otras personas harán cosas que no apruebes. El mundo seguirá siendo imperfecto. Esto no es derrota. Es inteligencia. Es trabajar con la realidad en lugar de contra ella.
      </p>

      <p>
        Cuando aceptas lo que no puedes cambiar y actúas con integridad en lo que sí puedes, algo extraordinario sucede. La tensión se disuelve. Encuentras paz no porque todo sea perfecto, sino porque has dejado de exigir que lo sea.
      </p>

      <h2>Tu práctica diaria</h2>
      <p>
        La paz interior es como cualquier habilidad. Se desarrolla con la práctica. Diariamente: observa sin juzgar, medita en silencio, ancla tu atención en el presente, alinea tus acciones con tus valores, suelta lo que no controlas.
      </p>

      <p>
        Habrá días donde sientas que perdiste la paz. Está bien. No es un fracaso; es simplemente la próxima oportunidad de cultivarla de nuevo. La paz no es un destino que alcanzas una vez. Es una práctica que retomas, día tras día, hasta que se convierte en quien eres.
      </p>
    `,
  },
  "por-que-soltar-no-es-rendirse": {
    titulo: "Por qué soltar no es rendirse — El arte de dejar ir lo que no puedes controlar",
    descripcion:
      "Entiende la diferencia profunda entre rendición y aceptación, y por qué dejar ir es el acto más valiente.",
    keywords: "soltar, dejar ir, aceptación, bienestar",
    contenido: `
      <p>
        Hay una frase que confunde a muchos: "Nunca te rindas." Es una frase motivadora, llena de determinación. Pero es incompleta. Porque hay una diferencia crucial entre luchar por lo que importa y pelear una batalla que ya perdiste.
      </p>

      <p>
        Soltar no es rendirse. Es saber cuál es tu verdadera batalla.
      </p>

      <h2>La confusión entre lucha y aceptación</h2>
      <p>
        Hemos crecido en una cultura que valora la voluntad, la persistencia, la tenacidad. Y estos son valores valiosos. Pero esta cultura a menudo ve la aceptación como debilidad. Como si soltar fuera lo mismo que rendirse.
      </p>

      <p>
        No lo es. Rendirse es abandonar lo que aún está dentro de tu poder. Es dejar de intentar cuando aún hay camino. Soltar, en cambio, es reconocer que ya hiciste lo que pudiste, y que el resultado está ahora fuera de tu mano.
      </p>

      <h2>El costo de no soltar</h2>
      <p>
        Cuando no sueltas lo que no puedes controlar, pagas un precio altísimo. Energía mental. Sueño perdido. Ansiedad crónica. Relaciones dañadas porque proyectas tu frustración en otros. Tu cuerpo se tensa. Tu sistema nervioso vive en alerta perpetua.
      </p>

      <p>
        He visto personas gastar años intentando cambiar a alguien que no quiere cambiar. Intentando recuperar una relación que se rompió irreversiblemente. Intentando controlar un mercado, un gobierno, un resultado que simplemente no está en su poder. Y todo lo que logran es envejecer rápidamente, amargarse, perder lo que sí tienen.
      </p>

      <h2>Qué es realmente tuyo controlar</h2>
      <p>
        El estoico Epicteto enseñaba una distinción simple pero profunda: algunos eventos están dentro de tu control, otros no. Dentro de tu control: tu esfuerzo, tu intención, tu acción, tus valores. Fuera de tu control: el resultado final, las decisiones de otros, el pasado, la enfermedad, la muerte.
      </p>

      <p>
        Un atleta está dentro de su control entrenar duro. Fuera de su control ganar. Entonces, ¿dónde debe enfocar su energía? En entrenar con excelencia. Y luego, soltar el resultado. Así vive sin ansiedad, porque hizo su parte.
      </p>

      <p>
        Lo mismo aplica a tu vida. ¿Puedes controlar si alguien te ama? No. Puedes controlar ser amoroso. ¿Puedes controlar si consigues el trabajo? No. Puedes controlar tu entrevista. ¿Puedes controlar el futuro? No. Puedes controlar tus acciones presentes. Enfoca allí.
      </p>

      <h2>Soltar el resultado para honrar el proceso</h2>
      <p>
        Una de las paradojas más hermosas de la vida es que cuando sueltas la obsesión con el resultado, a menudo ese resultado viene. No porque controles menos, sino porque enfocas más en lo que realmente importa: el proceso.
      </p>

      <p>
        Un escritor que escribe buscando bestseller a menudo produce trabajo mediocre. Un escritor que escribe porque necesita expresarse produce obra auténtica, y esta es la que conecta. Un emprendedor obsesionado con hacerse rico a menudo fracasa. Uno enfocado en resolver un problema real a menudo prospera.
      </p>

      <p>
        Soltar el resultado es liberador. Te permite enfocarte en la excelencia del proceso. Y paradójicamente, eso es lo que atrae buenos resultados.
      </p>

      <h2>El perdón como soltar</h2>
      <p>
        Una de las cosas más difíciles de soltar es el resentimiento. Alguien te hizo daño. Es justo estar herido. Pero en algún momento, necesitas preguntarte: ¿Cuál es el costo de no soltar?
      </p>

      <p>
        Cuando no perdonas, das a la otra persona el poder de seguir hiriéndote. Pero perdonar no significa que lo que hicieron fue bien. Significa que ya no les das ese poder. Significa que decides no permitir que tu pasado sea tu prisión.
      </p>

      <p>
        Entonces perdonas. Pero nota: perdonar es soltar, no olvidar. Recuerdas lo que sucedió. Aprendes de ello. Pero no lo cargas más.
      </p>

      <h2>Soltar las expectativas</h2>
      <p>
        Mucho de nuestro sufrimiento viene de las expectativas no cumplidas. Esperamos que la vida sea de una manera, que las personas actúen de otra, que el futuro llegue como lo planeamos.
      </p>

      <p>
        Pero la vida tiene su propio plan. Las personas tienen sus propios dramas. El futuro es impredecible. Y cuando chocas tu expectativa con la realidad, sufres.
      </p>

      <p>
        Una práctica es soltar las expectativas específicas. No "espero que me ame," sino "espero tener la oportunidad de amarle". No "espero ganar," sino "espero competir con honor". No "espero que todo sea perfecto," sino "espero hacerlo lo mejor que pueda". Ves la diferencia? La primera te encadena al resultado. La segunda te libera.
      </p>

      <h2>Soltar el pasado</h2>
      <p>
        Tu pasado fue. Sucedió. Tiene lecciones. Pero no tiene poder sobre ti a menos que le des poder. Cada día que eliges vivir en el resentimiento, la culpa, el "si hubiera", estás eligiendo no soltar.
      </p>

      <p>
        Soltar el pasado significa: honra lo que aprendiste, reconoce cómo te formó, y luego déjalo. Tu vida comienza ahora. En este momento. Con las opciones que tienes disponibles hoy.
      </p>

      <h2>Por qué soltar es el acto más valiente</h2>
      <p>
        Culturalmente, pensamos que la valentía es luchar. Pero hay otro tipo de valentía: la valentía de dejar ir. Es más fácil pelear que aceptar. Es más fácil culpar a otros que reconocer lo que no puedes controlar. Es más fácil vivir en resentimiento que perdonar.
      </p>

      <p>
        Soltar requiere vulnerabilidad. Requiere admitir que no puedes controlar todo. Requiere confiar. Y esa confianza, ese soltar, es donde comienza la verdadera paz.
      </p>

      <h2>Tu práctica de soltar</h2>
      <p>
        Hoy, identifica una cosa que estés aferrando. Una relación que no puedes cambiar. Un resultado que necesitas controlar. Una herida que no puedes soltar. Y pregúntate: ¿Cuál es el costo de aferrarse? ¿Cuál sería el beneficio de soltar?
      </p>

      <p>
        Soltar no es un acto único. Es una decisión que retomas cada día. Cada vez que la ansiedad vuelve, cada vez que quieres forzar un resultado, cada vez que el resentimiento surge. En ese momento, recuerda: no es rendirse. Es elegir tu libertad.
      </p>

      <p>
        Y esa libertad, ese soltar consciente, es lo que finalmente te permite vivir en paz.
      </p>
    `,
  },
};

export function generateStaticParams() {
  return Object.keys(ARTICULOS).map((slug) => ({
    slug,
  }));
}

export function generateMetadata({ params }: Props): Metadata {
  const articulo = ARTICULOS[params.slug as keyof typeof ARTICULOS];

  if (!articulo) {
    return {
      title: "Artículo no encontrado",
    };
  }

  return {
    title: `${articulo.titulo} — mepesamucho`,
    description: articulo.descripcion,
    keywords: articulo.keywords,
    openGraph: {
      title: articulo.titulo,
      description: articulo.descripcion,
      url: `https://mepesamucho.com/reflexiones/${params.slug}`,
      type: "article",
      authors: ["mepesamucho"],
      publishedTime: "2026-02-23T00:00:00Z",
    },
    alternates: {
      canonical: `https://mepesamucho.com/reflexiones/${params.slug}`,
    },
  };
}

export default function ArticuloPage({ params }: Props) {
  const articulo = ARTICULOS[params.slug as keyof typeof ARTICULOS];

  if (!articulo) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="max-w-[640px] mx-auto px-6 py-20">
        <Link
          href="/reflexiones"
          className="inline-block mb-12 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
        >
          &larr; Volver a reflexiones
        </Link>

        <article>
          <h1 className="font-[var(--font-heading)] text-3xl font-medium mb-6 leading-snug">
            {articulo.titulo}
          </h1>

          <p className="text-[var(--color-text-tertiary)] text-sm mb-12">
            23 de febrero, 2026
          </p>

          <div className="prose prose-invert max-w-none text-[var(--color-text-secondary)] leading-relaxed space-y-5">
            <div
              dangerouslySetInnerHTML={{ __html: articulo.contenido }}
            />
          </div>

          <div className="border-t border-[var(--color-accent)] mt-12 pt-12">
            <Link
              href="/"
              className="inline-block border border-[var(--color-accent)] text-[var(--color-accent)] rounded-full px-6 py-2.5 text-sm hover:bg-[var(--color-accent)] hover:text-[var(--color-bg)] transition-colors"
            >
              Quiero soltar lo que cargo
            </Link>
          </div>
        </article>
      </div>

      {/* Article Schema.org for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: articulo.titulo,
            description: articulo.descripcion,
            datePublished: "2026-02-23T00:00:00Z",
            dateModified: "2026-02-23T00:00:00Z",
            author: {
              "@type": "Organization",
              name: "mepesamucho",
            },
            publisher: {
              "@type": "Organization",
              name: "mepesamucho",
              logo: {
                "@type": "ImageObject",
                url: "https://mepesamucho.com/favicon.ico",
              },
            },
          }),
        }}
      />
    </main>
  );
}
