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
   asistentes (por ejemplo, en un grupo de WhatsApp).
2. Cada asistente envía `/join <código>` al bot. Un agente solo puede
   estar contribuyendo activamente a un evento a la vez.
3. Cuando encuentras un carácter, simplemente lo envías: `5 A` reporta
   que la posición 5 es `A`. No hace falta recordar ningún comando.
4. El bot mantiene un único mensaje por participante actualizado con el
   estado actual del código, editándolo cada vez que alguien reporta
   algo nuevo — no inunda el chat con un mensaje nuevo por cada reporte.
5. Si dos personas reportan valores distintos para la misma posición,
   ambos se conservan y se muestran como posibilidades separadas hasta
   que quien ha creado el evento resuelve la discrepancia con
   `/resolve`.
6. Cuando el evento termina, quien lo ha creado lo cierra con
   `/closeevent`, congelando el resultado final.

### Referencia de comandos

| Comando | Quién puede usarlo | Qué hace |
|---|---|---|
| `/start`, `/help` | cualquiera | Introducción y lista de comandos. |
| `/language <código>` | cualquiera | Establece tu idioma (`en`, `ca`, `es`, `fr`). |
| `/newevent <nombre> \| <longitud>` | cualquiera | Crea un nuevo evento IFS y obtiene su código de acceso. |
| `/sharetext <código> [idioma]` | cualquiera | Obtiene un texto listo para compartir invitando a unirse, opcionalmente en un idioma distinto del tuyo. |
| `/join <código>` | cualquiera | Únete a un evento. |
| `/leave` | participante | Sal del evento actual. |
| `/myevent` | cualquiera | Muestra en qué evento estás, si hay alguno. |
| `<posición> <valor>` (o `/submit <posición> <valor>`) | participante | Reporta el carácter encontrado en una posición. |
| `/status` (o `/code`) | participante | Muestra el estado actual del código cuando quieras. |
| `/resolve <posición> <valor>` | creador del evento | Elige el valor correcto cuando hay discrepancia. |
| `/unresolve <posición>` | creador del evento | Reabre una posición resuelta. |
| `/kick <usuario>` | creador del evento | Expulsa a un participante del evento. |
| `/closeevent` | creador del evento | Congela el evento y anuncia el código final. |
| `/events` | cualquiera | Lista los eventos que has creado. |

Cada jugador ve los mensajes del bot en su propio idioma, establecido una
vez con `/language` y recordado a partir de entonces.

## Estado del proyecto

Este proyecto está actualmente en **fase de diseño**. El modelo de
interacción descrito arriba está cerrado, pero todavía no se ha escrito
código de la aplicación. Consulta [`CLAUDE.md`](CLAUDE.md) (en inglés)
para el diseño técnico completo (modelo de datos, algoritmo de
resolución de conflictos, arquitectura de internacionalización) si
quieres contribuir.

## Arquitectura (prevista)

- **Runtime:** Cloudflare Workers, recibiendo las actualizaciones de
  Telegram vía webhook.
- **Framework del bot:** [grammY](https://grammy.dev).
- **Base de datos:** [Cloudflare D1](https://developers.cloudflare.com/d1/).
- **Lenguaje:** TypeScript.
- **Dominio:** un subdominio de `grifwl.blue` (por decidir).

Las instrucciones de instalación y despliegue se añadirán aquí en cuanto
exista una primera implementación.

## Licencia

MIT.
