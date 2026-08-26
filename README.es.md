<!-- Languages: [English](README.md) | [Català](README.ca.md) | Castellano | [Français](README.fr.md) -->

# IFS Passcode Relay

Un bot de Telegram que permite a los asistentes a un evento
**Ingress First Saturday (IFS)** construir colaborativamente, en tiempo
real, el passcode canjeable del evento.

**Idiomas:** [English](README.md) · [Català](README.ca.md) · Castellano · [Français](README.fr.md)

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
mantiene una vista compartida y en vivo del código a medida que se
completa — sin tener que recopilar capturas de pantalla manualmente en un
grupo de chat.

## Cómo funciona, desde el punto de vista de un jugador

1. Quien organiza el relevo de passcode de un IFS crea un evento con
   `/newevent` y obtiene un código corto para compartir con los
   asistentes (por ejemplo, en un grupo de WhatsApp) — el bot envía de
   inmediato un texto de invitación listo para pegar con ese código, y
   quien crea el evento se une a él automáticamente, ya que ser el
   organizador no le exime de cazar portales también. Por defecto, se da
   por hecho que el
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
   Barcelona` que choca con cualquier otro IFS de Barcelona.
2. El resto de asistentes envía `/join <código>` al bot, que también les
   invita a ejecutar `/sharetext` por si quieren ayudar a difundirlo. Un
   agente solo puede estar contribuyendo activamente a un evento a la vez.
3. Cuando encuentras un valor, simplemente envías su posición y el
   valor: `6 CIPHER` reporta que la posición 6 (la palabra) es `CIPHER`;
   `7 3` reporta que la posición 7 es el número `3`. No hace falta
   recordar ningún comando. Las letras se muestran en mayúsculas, pero
   las puedes escribir como quieras.
4. El bot mantiene un único mensaje por participante actualizado con el
   estado actual del código, editándolo cada vez que alguien reporta
   algo nuevo — no inunda el chat con un mensaje nuevo por cada reporte.
5. Si dos personas distintas reportan valores distintos para la misma
   posición, ambos se conservan: el bot muestra cada posible código
   completo en un bloque fácil de copiar, con cuántas personas lo
   respaldan — y, en los menos respaldados, quién los ha reportado, para
   que quien ha creado el evento pueda detectar un error o un troll. Si
   lo que envías no encaja con la posición esperada, o contradice lo que
   **otra persona** ya ha reportado, el bot te pide confirmación antes
   de registrarlo. Corregir tu **propio** reporte anterior es distinto:
   no hace falta confirmación, tu valor anterior en esa posición se
   sustituye directamente — y si era lo único que mantenía una
   discrepancia, la discrepancia desaparece al instante.
6. Quien ha creado el evento resuelve una discrepancia con `/resolve
   <posición> <valor>` — o, escrito solo como `/resolve <posición>`, el
   bot lista los valores reportados para esa posición con cuánta gente
   respalda cada uno — y, si alguno de esos apoyos es de confianza,
   cuántos lo son — y muestra un botón por valor (el más respaldado
   primero) para resolverla con un solo toque. Escribir `/resolve` solo,
   sin argumentos, repasa en cambio todas las posiciones todavía en
   discrepancia una por una: al resolver la que se muestra con sus
   botones, el bot envía enseguida la siguiente, hasta que avisa de que
   ya no queda ninguna. Quien ha creado el
   evento también puede marcar a un participante como de confianza o
   como troll si hace falta. Marcar a alguien como troll, solo para ese evento, descarta el
   resto de sus aportaciones y deja de enviarle actualizaciones —
   tampoco recibirá el passcode final cuando se cierre el evento.
7. Cuando el evento termina, quien lo ha creado lo cierra con
   `/closeevent`, que envía el passcode final como un mensaje **nuevo**
   a todos los participantes — no solo una edición — para que a nadie se
   le escape aunque no lo haya estado siguiendo activamente.

### Referencia de comandos

| Comando | Quién puede usarlo | Qué hace |
|---|---|---|
| `/start`, `/help` | cualquiera | Introducción y lista de comandos. |
| `/language <código>` | cualquiera | Establece tu idioma (`en`, `ca`, `es`, `fr`). |
| `/newevent <nombre> [\| <patrón>]` | cualquiera | Crea un nuevo evento IFS y obtiene su código de acceso. |
| `/sharetext [código] [idioma]` | cualquiera | Obtiene un texto listo para compartir invitando a unirse. `código` por defecto es tu evento actual, `idioma` el tuyo propio — ya se envía automáticamente una vez desde `/newevent`. |
| `/join <código>` | cualquiera | Únete a un evento. |
| `/leave` | participante | Sal del evento actual. |
| `/myevent` | cualquiera | Muestra en qué evento estás, si hay alguno. |
| `<posición> <valor>` (o `/submit <posición> <valor>`) | participante | Reporta el valor encontrado en una posición. |
| `/status` (o `/code`) | participante | Muestra el estado actual del código cuando quieras. |
| `/resolve <posición> [<valor \| @usuario>]` | creador del evento | Elige el valor correcto cuando hay discrepancia; sin valor, lista los valores reportados (con el desglose de apoyos de confianza) como botones para resolver. |
| `/resolve` (sin argumentos) | creador del evento | Repasa todas las posiciones todavía en discrepancia, una por una. |
| `/unresolve <posición>` | creador del evento | Reabre una posición resuelta. |
| `/trust <usuario>` | creador del evento | Marca a un participante como de confianza, para que su apoyo se destaque en la lista de candidatos de `/resolve`. |
| `/troll <usuario>` | creador del evento | Descarta las aportaciones de un participante y deja de actualizarlo (solo este evento). |
| `/untrust <usuario>` | creador del evento | Quita la marca de confianza a un participante. |
| `/kick <usuario>` | creador del evento | Expulsa a un participante del evento. |
| `/closeevent` | creador del evento | Congela el evento y anuncia el código final a todos. |
| `/events` | cualquiera | Lista los eventos que has creado. |

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
desde los mismos menús, añade las versiones `ca`/`es`/`fr` de abajo como
descripciones por idioma.

| Idioma | `/setdescription` (larga) | `/setabouttext` (corta) |
|---|---|---|
| `en` | Collaboratively build your Ingress First Saturday event's redeemable passcode in real time. Report the character you found and its position — the bot keeps everyone's code in sync, flags disagreements, and announces the final result. Available in English, Català, Castellano and Français. Send /help to start, or /newevent to create one for your IFS. | Real-time collaborative passcode relay for Ingress First Saturday events. |
| `ca` | Construeix en temps real, de manera col·laborativa, el passcode bescanviable del teu esdeveniment Ingress First Saturday. Reporta el caràcter que has trobat i la seva posició — el bot manté el codi sincronitzat per a tothom, marca les discrepàncies i anuncia el resultat final. Disponible en català, anglès, castellà i francès. Envia /help per començar, o /newevent per crear-ne un pel teu IFS. | Relleu col·laboratiu en temps real del passcode d'un Ingress First Saturday. |
| `es` | Construye en tiempo real, de forma colaborativa, el passcode canjeable de tu evento Ingress First Saturday. Reporta el carácter que has encontrado y su posición — el bot mantiene el código sincronizado para todos, marca las discrepancias y anuncia el resultado final. Disponible en español, inglés, catalán y francés. Envía /help para empezar, o /newevent para crear uno para tu IFS. | Relevo colaborativo en tiempo real del passcode de un Ingress First Saturday. |
| `fr` | Construisez en temps réel, de façon collaborative, le passcode échangeable de votre événement Ingress First Saturday. Signalez le caractère trouvé et sa position — le bot garde le code synchronisé pour tout le monde, signale les désaccords et annonce le résultat final. Disponible en français, anglais, catalan et espagnol. Envoyez /help pour commencer, ou /newevent pour en créer un pour votre IFS. | Relais collaboratif en temps réel du passcode d'un Ingress First Saturday. |

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

## Licencia

MIT.
