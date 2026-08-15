# `@apptoolkit/eslint-config`

Flat config compartido para ESLint 9+ y 10.

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

## Troubleshooting

Si ves un error de peer dependency faltante (por ejemplo, que no encuentra `eslint`), instala `eslint` en el paquete donde ejecutas lint:

```sh
npm i -D eslint
```

Si usas workspaces:

```sh
npm i -D -w @apptoolkit/mi-paquete eslint
```
