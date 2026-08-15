# `@apptoolkit/eslint-config`

Flat config compartido para ESLint 10+.

## Requisitos

- Este paquete **no** instala `eslint`.
- `eslint` se instala en el proyecto consumidor (peer dependency).

Ejemplo:

```sh
npm i -D eslint @apptoolkit/eslint-config
```

## Usage

```
import eslintConfig from '@apptoolkit/eslint-config';

export default eslintConfig;
```

## Monorepo

En monorepo, cada paquete que ejecute lint debe tener su propio `eslint` en `devDependencies`.
La config compartida usa ese `eslint` del paquete consumidor.

## Scripts Recomendados

Patron sugerido para cada paquete consumidor:

```json
{
	"scripts": {
		"lint": "eslint --config ../eslint-config/index.js src",
		"lint:fast": "eslint --cache --cache-location .eslintcache --config ../eslint-config/index.js src",
		"lint:ci": "eslint --no-cache --config ../eslint-config/index.js src"
	}
}
```

Para paquetes con `*.stories.*`, usa dos pasadas como en `@apptoolkit/form` y `@apptoolkit/ui` para mantener overrides por glob.

## Setup CLI

Puedes aplicar este patron automaticamente con el comando `setup`:

```sh
npx -p @apptoolkit/eslint-config apptoolkit-eslint-config setup
```

Opciones:

- `--dry-run`: imprime el `package.json` resultante sin escribir.
- `--package <ruta>`: permite actualizar otro paquete desde la raiz del monorepo.
- `--stories`: usa el patron de dos pasadas para `*.stories.*`.

Ejemplos:

```sh
npx @apptoolkit/eslint-config setup --dry-run
npx @apptoolkit/eslint-config setup --package packages/form --stories
```

## Sobre Automatizar Scripts

La config de ESLint no puede inyectar scripts en `package.json`.
Los scripts pertenecen a npm/workspaces y se definen en cada paquete.

Se puede automatizar con este `setup` explicito (o con un script/codemod del repo), pero no desde la carga normal de la config de ESLint por si sola.

## Troubleshooting

Si ves un error de peer dependency faltante (por ejemplo, que no encuentra `eslint`), instala `eslint` en el paquete donde ejecutas lint:

```sh
npm i -D eslint
```

Si usas workspaces:

```sh
npm i -D -w @apptoolkit/mi-paquete eslint
```
