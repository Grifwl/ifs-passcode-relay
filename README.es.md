<!-- Languages: [English](README.md) | [Català](README.ca.md) | Castellano | [Français](README.fr.md) | [Galego](README.gl.md) | [Euskara](README.eu.md) | [Português](README.pt.md) | [Italiano](README.it.md) | [Deutsch](README.de.md) -->

# IFS Passcode Relay

Un bot de Telegram que permite a los asistentes a un evento
**Ingress First Saturday (IFS)** construir colaborativamente, en tiempo
real, el passcode canjeable del evento.

**Idiomas:** [English](README.md) · [Català](README.ca.md) · Castellano · [Français](README.fr.md) · [Galego](README.gl.md) · [Euskara](README.eu.md) · [Português](README.pt.md) · [Italiano](README.it.md) · [Deutsch](README.de.md)

## ¿Qué es esto?

Ingress First Saturday es un evento presencial recurrente del juego móvil
[Ingress](https://ingress.com). Durante el evento, se muestran a los
jugadores las imágenes de una serie de portales; visitarlos sobre el
terreno e inspeccionar su contenido multimedia revela un carácter.
Concatenando los caracteres en el orden correcto se obtiene un passcode
canjeable en la tienda del juego por un paquete de objetos del IFS.

Puede haber varios IFS en marcha a la vez, cada uno con su propio
passcode. Este bot permite a todos los asistentes a un IFS concreto
reportar qué carácter han encontrado y en qué posición corresponde, y
mantiene una vista compartida y en vivo del passcode a medida que se
completa — sin tener que recopilar capturas de pantalla manualmente en un
grupo de chat.

## Cómo funciona, desde el punto de vista de un jugador

1. Quien organiza el relevo de passcode de un IFS crea un evento con
   `/newevent` y obtiene un código corto para compartir con los
   asistentes (por ejemplo, en un grupo de WhatsApp) — el bot envía de
   inmediato un texto de invitación listo para pegar con ese código, y
   quien crea el evento se une a él automáticamente — como su
   administrador —, ya que ser el organizador no le exime de cazar
   portales también. También empieza marcado como de confianza para su
   propio evento, igual que haría `/trust` con cualquier otra persona. Por
   defecto, se da por hecho que el
   passcode sigue el patrón `XXX99*999XX` (tres letras, dos números, una
   palabra entera, tres números, dos letras) — quien crea el evento
   puede establecer otro patrón si ese IFS usa otro formato. El nombre
   del evento no necesita ser único: hacer `/newevent` dos veces con
   exactamente el mismo nombre no es un error, simplemente crea dos
   eventos separados con dos códigos de acceso distintos. Como los
   asistentes solo ven el nombre a la hora de elegir qué código seguir,
   conviene que sea lo bastante específico para distinguir eventos IFS
   con el mismo nombre — por ejemplo, `/newevent Barcelona 2026-08`,
   incluyendo el año y el mes, en lugar de un simple `/newevent
   Barcelona` que choca con cualquier otro IFS de Barcelona. Si estás en
   otro evento todavía sin resolver (no cerrado), primero te pide
   confirmación — lo administres o no — ya que crear este lo deja
   atrás; si dices que no, no se crea nada. Si aquel evento ya estaba
   cerrado, o no estabas en ninguno, se crea de inmediato sin
   preguntar. En cualquier caso, si administrabas el que dejas, se
   traspasa antes, igual que haría `/leave` (ver el punto 6 más abajo).
2. El resto de asistentes envía `/join <código>` al bot, que también les
   invita a ejecutar `/sharetext` por si quieren ayudar a difundirlo. Un
   agente solo puede estar contribuyendo activamente a un evento a la vez,
   así que unirse a uno distinto mientras el actual sigue sin resolver
   pide confirmar el cambio primero — y, si administrabas el anterior,
   lo traspasa igualmente. Si tu evento actual ya está cerrado, o no
   tienes ninguno, `/join` te cambia de inmediato sin preguntar. Si el
   código al que te unes pertenece a un evento que se
   cerró porque su administrador anterior lo dejó sin nadie elegible
   para tomar el relevo, `/join` lo reabre y te convierte en su
   administrador en lugar de rechazar el código.
3. Cuando encuentras un valor, simplemente envías su posición y el
   valor: `6 GLYPH` reporta que la posición 6 (la palabra) es `GLYPH`;
   `7 3` reporta que la posición 7 es el número `3`. No hace falta
   recordar ningún comando. Las letras se muestran en mayúsculas, pero
   las puedes escribir como quieras.
4. El bot mantiene un único mensaje por participante actualizado con el
   estado actual del passcode, editándolo cada vez que alguien reporta
   algo nuevo — no inunda el chat con un mensaje nuevo por cada reporte.
5. Si dos personas distintas reportan valores distintos para la misma
   posición, ambos se conservan: el bot muestra cada posible passcode
   completo en un bloque fácil de copiar, con cuántas personas lo
   respaldan — y, en los menos respaldados, quién los ha reportado, para
   que quien administra el evento pueda detectar un error o un troll. Si
   lo que envías no encaja con la posición esperada, o contradice lo que
   **otra persona** ya ha reportado, el bot te pide confirmación antes
   de registrarlo. Corregir tu **propio** reporte anterior es distinto:
   no hace falta confirmación, tu valor anterior en esa posición se
   sustituye directamente — y el bot te dice cuál era ese valor
   anterior, por si la propia corrección ha sido un error y quieres
   volver a enviarlo. Si era lo único que mantenía una discrepancia, la
   discrepancia desaparece al instante.
   ¿Has enviado un valor a la posición equivocada, o todavía no la
   conoces de verdad? Envía solo el número de posición, sin nada
   después (o `/submit <posición>`), para eliminar tu reporte en esa
   posición — sin confirmación, y el bot te dice qué valor ha eliminado
   por si también quieres deshacerlo.
6. Quien administra el evento resuelve una discrepancia con `/resolve
   <posición> <valor>` — o, escrito solo como `/resolve <posición>`, el
   bot lista los valores reportados para esa posición con cuánta gente
   respalda cada uno — y, si alguno de esos apoyos es de confianza,
   cuántos lo son — y muestra un botón por valor (el más respaldado
   primero) para resolverla con un solo toque. Escribir `/resolve` solo,
   sin argumentos, repasa en cambio todas las posiciones todavía en
   discrepancia una por una: al resolver la que se muestra con sus
   botones, el bot envía enseguida la siguiente, hasta que avisa de que
   ya no queda ninguna. Ese aviso nunca ofrece un atajo para cerrar el
   evento, aunque en ese momento todas las posiciones ya tengan un valor
   establecido — que quienes reportan estén de acuerdo entre sí no es lo
   mismo que el passcode funcione de verdad, así que el bot remite a
   quien administra a `/verify` (ver más abajo). Quien administra el
   evento también puede marcar a un participante como de confianza o
   como troll si hace falta. Marcar a alguien como troll, solo para ese
   evento, descarta el resto de sus aportaciones y deja de enviarle
   actualizaciones — tampoco recibirá el passcode final cuando se cierre
   el evento.

   Cuando solo quedan pocas posiciones en discrepancia, puede ser más
   rápido probar directamente unos cuantos de los bloques de passcode
   renderizados en la pantalla de canje del juego. Una vez que uno de
   ellos se confirma correcto allí, quien administra el evento lo pega
   de vuelta con `/verify <passcode>` y el bot averigua, para todas las
   posiciones a la vez, qué valor reportado lo produjo.
7. `/verify <passcode>` es la **única** forma de completar y cerrar un
   evento — no existe un comando separado para "cerrar". Aunque todas
   las posiciones ya coincidan, ese acuerdo no se ha comprobado contra
   el propio juego, así que quien administra debe copiar un passcode
   candidato, pegarlo en la tienda, confirmar que se acepta, y pegar ese
   mismo passcode en `/verify`. Una vez coincide, el bot resuelve todas
   las posiciones a partir de él y envía el passcode final como un
   mensaje **nuevo** a todos los participantes — no solo una edición —
   para que a nadie se le escape aunque no lo haya estado siguiendo
   activamente.

### Referencia de comandos

| Comando | Quién puede usarlo | Qué hace |
|---|---|---|
| `/start`, `/help` | cualquiera | Introducción y lista de comandos. |
| `/language <código>` | cualquiera | Establece tu idioma (`en`, `ca`, `es`, `fr`, `gl`, `eu`, `pt`, `it`, `de`). |
| `/newevent <nombre> [\| <patrón>]` | cualquiera | Crea un nuevo evento IFS y obtiene su código de acceso; te une automáticamente y te marca como de confianza. Aquí la `\|` separa el nombre del patrón, no significa "elige uno u otro" — p. ej. `/newevent Barcelona 2026-08 \| XXX99*999XX`. Pide confirmación primero si tu evento actual todavía no está resuelto (decir que no no crea nada); ese se traspasa antes, igual que haría `/leave`. |
| `/sharetext [código] [idioma]` | cualquiera | Obtiene un texto listo para compartir invitando a unirse. `código` por defecto es tu evento actual, `idioma` el tuyo propio — ya se envía automáticamente una vez desde `/newevent`. |
| `/join <código>` | cualquiera | Únete a un evento — pide confirmación solo si tu evento actual todavía no está resuelto, traspasándolo si lo administrabas; se omite si no tienes ninguno o ya está cerrado. Un código cerrado sin administrador se reabre bajo tu cargo en vez de rechazarse. |
| `/leave` | participante | Sal del evento actual. Si eres quien lo administra, otro participante asume el rol automáticamente (priorizando a los de confianza y, si no, a quien más haya aportado), o se cierra como inacabado si no hay nadie apto — el mismo traspaso ocurre si sales creando o uniéndote a otro evento en vez de hacer `/leave`. |
| `/current` | cualquiera | Muestra el evento actual: nombre, código, patrón, número de participantes y quién lo administra. |
| `<posición> <valor>` (o `/submit <posición> <valor>`) | participante | Reporta el valor encontrado en una posición. |
| `<posición>` sola (o `/submit <posición>`) | participante | Elimina tu propio reporte en esa posición, si existe. |
| `/status` | participante | Muestra el estado actual del passcode cuando quieras; además traslada las próximas actualizaciones en directo a este nuevo mensaje, por si el anterior ha quedado muy arriba en la conversación. |
| `/resolve <posición> [<valor \| @usuario>]` | administrador del evento | Elige el valor correcto cuando hay discrepancia; sin valor, lista los valores reportados (con el desglose de apoyos de confianza) como botones para resolver. |
| `/resolve` (sin argumentos) | administrador del evento | Repasa todas las posiciones todavía en discrepancia, una por una; cuando ya no queda ninguna, remite a `/verify` — el consenso por sí solo nunca cierra el evento. |
| `/unresolve <posición>` | administrador del evento | Reabre una posición resuelta. |
| `/trust <usuario>` | administrador del evento | Marca a un participante como de confianza, para que su apoyo se destaque en la lista de candidatos de `/resolve`. |
| `/troll <usuario>` | administrador del evento | Descarta las aportaciones de un participante y deja de actualizarlo (solo este evento). |
| `/untrust <usuario>` | administrador del evento | Quita la marca de confianza a un participante; si estaba marcado troll, también le actualiza el mensaje de estado de golpe. |
| `/kick <usuario>` | administrador del evento | Expulsa a un participante del evento. |
| `/promote <usuario>` | administrador del evento | Cede el rol de administrador a otro participante ya unido al evento; también lo marca de confianza, igual que `/newevent` hace con quien crea el evento. |
| `/claim` | participante | Intenta asumir el cargo de administrador si el actual lleva 30+ minutos inactivo; tiene 5 minutos para aceptarlo, rechazarlo o no responder antes de que se haga efectivo. |
| `/verify <passcode>` | administrador del evento | La única forma de cerrar un evento: pega un passcode confirmado correcto en la pantalla de canje del juego; resuelve todas las posiciones a partir de él a la vez, congela el evento y anuncia el passcode final a todos. |
| `/events` | cualquiera | Lista todos los eventos en los que has participado, actuales o pasados. |

Cada jugador ve los mensajes del bot en su propio idioma, establecido una
vez con `/language` y recordado a partir de entonces.

## Estado del proyecto

**En marcha**, en [`@ifs_relay_bot`](https://t.me/ifs_relay_bot) en
Telegram. Todos los comandos descritos arriba están implementados y
desplegados. Consulta [`CLAUDE.md`](CLAUDE.md) (en inglés) para el
diseño técnico completo (modelo de datos, algoritmo de resolución de
conflictos, arquitectura de internacionalización) si quieres
contribuir.

## Arquitectura

- **Runtime:** Cloudflare Workers, recibiendo las actualizaciones de
  Telegram vía webhook.
- **Framework del bot:** [grammY](https://grammy.dev).
- **Base de datos:** [Cloudflare D1](https://developers.cloudflare.com/d1/).
- **Lenguaje:** TypeScript.
- **Dominio:** `ifspasscoderelay.grifwl.blue`.

## Guía de instalación

Estos son pasos que se hacen una sola vez para levantar la
infraestructura del bot — una vez para todo el proyecto, no una vez por
IFS. Los pasos 1, 3 y 4 no requieren que exista aún el código de la
aplicación; los pasos 2 y 5 necesitan un Worker desplegado, así que van
al final, en cuanto empiece la implementación.

### 1. Crear el bot de Telegram

1. Abre una conversación con [@BotFather](https://t.me/BotFather) en
   Telegram.
2. Envía `/newbot`, elige un nombre para mostrar y un nombre de usuario
   único terminado en `bot` (p.ej. `IfsPasscodeRelayBot`).
3. BotFather responde con un **token del bot** — trátalo como una
   contraseña (quien lo tenga puede enviar mensajes haciéndose pasar por
   el bot). Se guarda como secreto de Cloudflare en el paso 4; nunca se
   sube a este repositorio.
4. Todavía hablando con BotFather, configura el perfil público del bot:
   - `/setuserpic` — sube una imagen de perfil.
   - `/setdescription` — la descripción larga que se muestra en la
     pantalla vacía del chat, antes de que nadie haya hablado con él.
   - `/setabouttext` — la biografía corta de la página de perfil.
   - `/setjoingroups` → *Disable*. El bot está pensado para chats
     privados 1 a 1 — el mensaje de estado en vivo de cada participante
     se edita in situ, lo cual solo tiene sentido en un chat con él y el
     bot a solas — así que el uso en grupos queda desactivado.

   No hace falta `/setcommands`: el bot registra su propia lista de
   comandos directamente desde el código, vía el `setMyCommands` de la
   Bot API, así que Telegram muestra las sugerencias de autocompletar
   automáticamente y nunca pueden desincronizarse de una lista
   mantenida a mano en BotFather.

#### Descripción y texto "about" sugeridos

Establece primero la versión en inglés con `/setdescription` y
`/setabouttext` — es la que usa BotFather como alternativa para
cualquier idioma de cliente de Telegram sin traducción propia. Después,
desde los mismos menús, añade las versiones `ca`/`es`/`fr`/`gl`/`eu`/`pt`/`it`/`de` de
abajo como descripciones por idioma.

| Idioma | `/setdescription` (larga) | `/setabouttext` (corta) |
|---|---|---|
| `en` | Collaboratively build your Ingress First Saturday event's redeemable passcode in real time. Report the character you found and its position — the bot keeps everyone's passcode in sync, flags disagreements, and announces the final result. Available in English, Català, Castellano, Français, Galego, Euskara, Português, Italiano and Deutsch. Send /help to start, or /newevent to create one for your IFS. | Real-time collaborative passcode relay for Ingress First Saturday events. |
| `ca` | Construeix en temps real, de manera col·laborativa, el passcode bescanviable del teu esdeveniment Ingress First Saturday. Reporta el caràcter que has trobat i la seva posició — el bot manté el passcode sincronitzat per a tothom, marca les discrepàncies i anuncia el resultat final. Disponible en català, anglès, castellà, francès, gallec, basc, portuguès, italià i alemany. Envia /help per començar, o /newevent per crear-ne un pel teu IFS. | Relleu col·laboratiu en temps real del passcode d'un Ingress First Saturday. |
| `es` | Construye en tiempo real, de forma colaborativa, el passcode canjeable de tu evento Ingress First Saturday. Reporta el carácter que has encontrado y su posición — el bot mantiene el passcode sincronizado para todos, marca las discrepancias y anuncia el resultado final. Disponible en español, inglés, catalán, francés, gallego, euskera, portugués, italiano y alemán. Envía /help para empezar, o /newevent para crear uno para tu IFS. | Relevo colaborativo en tiempo real del passcode de un Ingress First Saturday. |
| `fr` | Construisez en temps réel, de façon collaborative, le passcode échangeable de votre événement Ingress First Saturday. Signalez le caractère trouvé et sa position — le bot garde le passcode synchronisé pour tout le monde, signale les désaccords et annonce le résultat final. Disponible en français, anglais, catalan, espagnol, galicien, basque, portugais, italien et allemand. Envoyez /help pour commencer, ou /newevent pour en créer un pour votre IFS. | Relais collaboratif en temps réel du passcode d'un Ingress First Saturday. |
| `gl` | Constrúe en tempo real, de forma colaborativa, o passcode canxeable do teu evento Ingress First Saturday. Reporta o carácter que atopaches e a súa posición — o bot mantén o passcode sincronizado para todos, marca as discrepancias e anuncia o resultado final. Dispoñible en galego, inglés, catalán, castelán, francés, éuscaro, portugués, italiano e alemán. Envía /help para empezar, ou /newevent para crear un para o teu IFS. | Relevo colaborativo en tempo real do passcode dun Ingress First Saturday. |
| `eu` | Osatu denbora errealean, elkarlanean, zure Ingress First Saturday ekitaldiaren pasakode kanjeagarria. Jakinarazi aurkitu duzun karakterea eta bere posizioa — botak guztien pasakodea sinkronizatuta mantentzen du, desadostasunak markatzen ditu eta azken emaitza iragartzen du. Euskaraz, ingelesez, katalanez, gaztelaniaz, frantsesez, galizieraz, portugesez, italieraz eta alemanez eskuragarri. Bidali /help hasteko, edo /newevent zure IFS-rako bat sortzeko. | Ingress First Saturday ekitaldien pasakode-errelebo kolaboratiboa, denbora errealean. |
| `pt` | Construa em tempo real, de forma colaborativa, o passcode resgatável do seu evento Ingress First Saturday. Reporte o caractere que encontrou e sua posição — o bot mantém o passcode sincronizado para todos, sinaliza discrepâncias e anuncia o resultado final. Disponível em português, inglês, catalão, castelhano, francês, galego, basco, italiano e alemão. Envie /help para começar, ou /newevent para criar um para o seu IFS. | Revezamento colaborativo em tempo real do passcode de um Ingress First Saturday. |
| `it` | Costruisci in tempo reale, in modo collaborativo, il passcode riscattabile del tuo evento Ingress First Saturday. Segnala il carattere che hai trovato e la sua posizione — il bot mantiene il passcode sincronizzato per tutti, segnala i disaccordi e annuncia il risultato finale. Disponibile in italiano, inglese, catalano, spagnolo, francese, galiziano, basco, portoghese e tedesco. Invia /help per iniziare, o /newevent per crearne uno per il tuo IFS. | Staffetta collaborativa in tempo reale del passcode di un Ingress First Saturday. |
| `de` | Baue in Echtzeit, gemeinsam mit anderen, den einlösbaren Passcode deines Ingress-First-Saturday-Events. Melde das gefundene Zeichen und seine Position — der Bot hält den Passcode für alle synchron, markiert Uneinigkeiten und verkündet das Endergebnis. Verfügbar auf Deutsch, Englisch, Katalanisch, Spanisch, Französisch, Galicisch, Baskisch, Portugiesisch und Italienisch. Sende /help zum Starten, oder /newevent, um eines für dein IFS zu erstellen. | Kollaborative Echtzeit-Passcode-Staffel für Ingress-First-Saturday-Events. |

### 2. Crear el Worker de Cloudflare y la base de datos D1

Requiere una cuenta de Cloudflare con la zona `grifwl.blue` ya añadida, y
[wrangler](https://developers.cloudflare.com/workers/wrangler/)
instalado (`npm install -g wrangler`, o usar `npx wrangler`).

1. `wrangler login` para autenticar la CLI.
2. `wrangler d1 create ifs-passcode-relay` crea la base de datos D1 y
   muestra un `database_id` — guárdalo, irá al binding
   `[[d1_databases]]` (llamado `DB`) de `wrangler.toml` en cuanto exista
   el código.
3. En cuanto exista el esqueleto de la aplicación, `wrangler deploy`
   publica el Worker por primera vez.

### 3. Asignar el subdominio

El bot vive en **`ifspasscoderelay.grifwl.blue`**. Como la zona
`grifwl.blue` ya está en la misma cuenta de Cloudflare que se usa para
desplegar, no hace falta ningún paso manual en el panel — se declara
como [Custom
Domain](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
directamente en `wrangler.toml`:

```toml
routes = [
  { pattern = "ifspasscoderelay.grifwl.blue", custom_domain = true }
]
```

`wrangler deploy` provisiona entonces el registro DNS y el certificado
TLS automáticamente. El panel solo hace falta como alternativa si la
zona necesita alguna vez atención manual (p.ej. si resulta que vive en
una cuenta de Cloudflare distinta de aquella con la que `wrangler` ha
iniciado sesión).

### 4. Publicar el token del bot como secreto

1. `wrangler secret put BOT_TOKEN` y pega el token del paso 1 cuando se
   solicite — esto lo guarda cifrado en Cloudflare, expuesto al Worker
   como `env.BOT_TOKEN`, y nunca se sube al repositorio.
2. Para el desarrollo local, pon el mismo valor en `.dev.vars` (ya
   excluido de git) como `BOT_TOKEN=...`.
3. Genera también una cadena aleatoria para usar como secreto del
   webhook (p.ej. `openssl rand -hex 32`) y guárdala de la misma manera,
   como `TELEGRAM_WEBHOOK_SECRET` — el Worker la usa para rechazar
   cualquier petición que no venga realmente de Telegram (ver el paso
   5).

### 5. Apuntar Telegram hacia el Worker (webhook)

Una vez el Worker esté desplegado y accesible en su URL pública:

```sh
curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://ifspasscoderelay.grifwl.blue/telegram/webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>"
```

Telegram incluirá entonces ese mismo secreto en la cabecera
`X-Telegram-Bot-Api-Secret-Token` de cada actualización que envíe; el
Worker debe comprobar que coincide antes de procesar nada, y rechazar la
petición si no es así — esto es lo que evita que cualquier otro pueda
enviar actualizaciones falsas a la URL pública del webhook. Comprueba que
el webhook está registrado con:

```sh
curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
```

### 6. Configurar el panel privado de administración

Hay un panel privado, de solo lectura, en `/admin` (p.ej.
`https://ifspasscoderelay.grifwl.blue/admin`), para inspeccionar los
datos en vivo de D1 sin abrir una sesión interactiva de `wrangler d1
execute`. Está protegido con contraseña, y los datos que pertenecen a un
evento concreto (participantes, reportes, candidatos, resoluciones,
marcas de confianza, negociaciones de `/claim`) solo se muestran una vez
eliges uno en el desplegable — las tablas globales (eventos, usuarios,
palabras conocidas, creaciones de evento pendientes) siempre se ven.
Nada se actualiza solo: cada vista es una instantánea del momento en que
la cargaste o actualizaste por última vez, con un botón de actualizar
manual para volver a consultar cuando quieras.

1. Genera una contraseña y una clave de firma aleatoria separada para
   sus cookies de sesión (p.ej. `openssl rand -hex 24` para la
   contraseña, `openssl rand -hex 32` para la clave), y publica ambas
   igual que el token del bot: `wrangler secret put
   ADMIN_DASHBOARD_PASSWORD` y `wrangler secret put
   ADMIN_SESSION_SECRET`.
2. Para el desarrollo local, añade los mismos dos valores a `.dev.vars`
   como `ADMIN_DASHBOARD_PASSWORD=...` y `ADMIN_SESSION_SECRET=...`.

## Licencia

MIT.
