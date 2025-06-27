<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>

# URL Shortener API

API para encurtamento de URLs com autenticação JWT utilizando NestJS e TypeORM com MySQL.

## Tecnologias

- Node.js v22.16.0
- NestJS
- TypeORM
- MySQL
- JWT (JSON Web Token)
- Swagger

---

## Instalação e Execução

### Pré-requisitos

- Node.js instalado (v22.16.0)
- Banco de dados MySQL rodando localmente na porta 3306

### Instalação das dependências

```bash
npm install
```

### Rodar a aplicação

```bash
npm run start:dev
```

### Rodar os testes unitários

```bash
npm run test
```
---

## Configurações

### Variáveis de Ambiente

Crie um arquivo `.env` com base no `.env.example`:

```env
# Configurações do Banco de Dados MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=seu_usuario_mysql
DB_PASSWORD=sua_senha_mysql
DB_NAME=url_shortener

# Autenticação JWT
JWT_SECRET=uma_chave_secreta
JWT_EXPIRES_IN=1h

# Configurações da Aplicação
APP_PORT=3000
APP_BASE_URL=http://localhost:3000
NODE_ENV=development

# Configurações do Encurtador
SHORT_CODE_LENGTH=6
BASE_SHORT_URL=http://localhost
```

---

## Testes Unitários

### Cobertura de arquivos

- `auth.service.ts`
- `user.service.ts`
- `short-url.service.ts`

### Rodando os testes

```bash
npm run test
```

Ou utilize a extensão Jest Runner no VSCode.

---

## Documentação Swagger

Acesse em: [http://localhost:3000/api](http://localhost:3000/api)

Utilize o botão "Authorize" para inserir o token JWT nos endpoints protegidos.

## Autenticação

### Estratégia

JWT (Bearer Token)

### Exemplo de login

```json
{
  "email": "usuario@email.com",
  "senha": "senha123"
}
```

#### Resposta com sucesso

```json
{
  "access_token": "<TOKEN>"
}
```

#### Resposta com erro

```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

---

## Endpoints

### Módulo de Autenticação (`/auth`)

- `POST /auth/login`: Realiza login e retorna o token JWT.

### Módulo de Usuário (`/users`)

- `POST /users/register`: Registra um novo usuário.

### Módulo de Encurtamento de URL (`/`)

- `POST /shorten`: Encurta uma URL (público ou autenticado).
- `GET /:shortCode`: Redireciona para a URL original e conta o clique.
- `GET /user/urls`: Lista as URLs do usuário autenticado com paginação.
- `PATCH /short-url/:id`: Atualiza a URL (usuário autenticado).
- `DELETE /short-url/:id`: Exclui a URL (usuário autenticado).

---

## Exemplo de uso

### Encurtar uma URL (público)

```http
POST /shorten
Content-Type: application/json

{
  "originalUrl": "https://exemplo.com"
}
```

### Encurtar uma URL (autenticado)

```http
POST /shorten
Authorization: Bearer <token>
Content-Type: application/json

{
  "originalUrl": "https://exemplo.com"
}
```

### Redirecionar

```http
GET /abc123
```

### Listar URLs do usuário

```http
GET /user/urls?limit=10&offset=0
Authorization: Bearer <token>
```

---

## Licença

MIT

---

Feito por Arlesson Menezes

