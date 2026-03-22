# All Steam Time

Landing y MVP construidos con `Next.js 16`, `React 19`, `TypeScript` y `Tailwind CSS 4` para sumar las horas de juego totales de toda una biblioteca publica de Steam.

## Que hace

- Acepta `SteamID64`, `vanity URL` o URL completa del perfil.
- Resuelve el identificador en servidor usando la Steam Web API.
- Consulta la biblioteca visible del usuario con `GetOwnedGames`.
- Suma `playtime_forever` de todos los productos devueltos por Steam.
- Enriquece cada app con `appdetails` del Store API para distinguir entre `game`, `software` y tipo no resuelto.
- Muestra horas totales, dias equivalentes, numero de productos y top 5 con mas playtime.

## Stack

- `Next.js 16` con `App Router`
- `React 19`
- `TypeScript`
- `Tailwind CSS 4`
- `zod` para validar el input del endpoint

## Puesta en marcha

1. Instala dependencias:

```bash
npm install
```

2. Crea tu archivo de entorno:

```bash
cp .env.example .env.local
```

3. Rellena `STEAM_API_KEY` en `.env.local`.

4. Levanta el proyecto:

```bash
npm run dev
```

5. Abre `http://localhost:3000`.

## Como conseguir la Steam API key

Valve permite crear una Web API key desde:

- `https://steamcommunity.com/dev/apikey`

Importante:

- La key se usa solo en servidor.
- No debe exponerse en componentes cliente.
- No se pide la password del usuario final en ningun momento.

## Inputs soportados

- `76561198000000000`
- `gaben`
- `https://steamcommunity.com/id/gaben`
- `https://steamcommunity.com/profiles/76561197960287930`

## Limitaciones del MVP

- La app depende de que el perfil exista y de que la biblioteca sea visible publicamente.
- Si el perfil es privado o la biblioteca esta oculta, Steam puede no devolver productos.
- El total mostrado depende estrictamente de `playtime_forever`, que es la metrica oficial devuelta por Steam.
- La inclusion real de software depende de que Steam lo devuelva en `GetOwnedGames`; cuando lo hace, la app ya lo clasifica y lo suma al total.

## Estructura del proyecto

```text
src/
  app/
    api/steam/route.ts      # Endpoint server-side que habla con Steam
    globals.css             # Tema global y look gaming oscuro
    layout.tsx              # Metadata y tipografias
    page.tsx                # Landing principal
  components/
    steam-lookup-experience.tsx  # Formulario y resultado interactivo
  lib/
    format.ts               # Helpers de formato
    steam.ts                # Parsing, validacion e integracion con Steam
  types/
    steam.ts                # Tipos compartidos de respuesta
```

## Decisiones de arquitectura

- `Route Handler`: oculta `STEAM_API_KEY` y concentra la logica del proveedor externo.
- `Server-side fetch`: evita exponer secretos en el navegador.
- `Client component` para la experiencia interactiva: mantiene el formulario y los estados de carga/error sin refresco completo.
- `README + comentarios cortos`: documentacion funcional tanto para arrancar el proyecto como para entender la logica no obvia del codigo.

## Roadmap sugerido

- Añadir comparativa entre dos perfiles.
- Guardar historico de consultas.
- Generar una tarjeta compartible tipo "Steam Wrapped".
- Añadir modo ranking con amigos o clanes.
- Preparar despliegue en `Vercel`.

## Scripts

- `npm run dev`: desarrollo local.
- `npm run lint`: lint del proyecto.
- `npm run build`: build de produccion.
- `npm run start`: arranque de la build generada.
