# CARBONO POWERLAB

Plataforma web academica para gestion integral de gimnasio. Permite administrar clientes, entrenadores, rutinas, progreso fisico, membresias, reportes basicos y mensajes de contacto.


## Tecnologias

- Frontend: Angular, Angular Routing, HttpClient, formularios reactivos y template-driven.
- Backend: Node.js, Express, CORS, dotenv, bcryptjs, jsonwebtoken.
- Base de datos: MySQL con mysql2/promise.
- API: REST propia.

## Estructura

```text
carbono-powerlab/
  frontend/
  backend/
  carbono_powerlab.sql
  README.md
```

## Base de datos

1. Abrir MySQL.
2. Importar el archivo `carbono_powerlab.sql`.

Ejemplo:

```bash
mysql -u root -p < carbono_powerlab.sql
```

La base de datos creada se llama `carbono_powerlab_db`.

## Backend

Entrar a la carpeta:

```bash
cd backend
```

Instalar dependencias:

```bash
npm install
```

Configurar `.env` si tu MySQL usa otra clave o puerto:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=carbono_powerlab_db
DB_PORT=3306
JWT_SECRET=carbono_powerlab_secret
PORT=3000
```

Ejecutar:

```bash
npm start
```

API local:

```text
http://localhost:3000
```

## Frontend

Entrar a la carpeta:

```bash
cd frontend
```

Instalar dependencias:

```bash
npm install
```

Ejecutar:

```bash
npm start
```

Aplicacion local:

```text
http://localhost:4200
```

## Usuarios de prueba

Administrador:

```text
correo: admin@carbonopowerlab.com
password: 123456
```

Entrenador:

```text
correo: entrenador@carbonopowerlab.com
password: 123456
```

Cliente:

```text
correo: cliente@carbonopowerlab.com
password: 123456
```

## Endpoints principales

Auth:

```text
POST /api/auth/register
POST /api/auth/login
```

Usuarios:

```text
GET    /api/usuarios
GET    /api/usuarios/:id
POST   /api/usuarios
PUT    /api/usuarios/:id
DELETE /api/usuarios/:id
```

Membresias:

```text
GET    /api/membresias
GET    /api/membresias/:id
GET    /api/membresias/cliente/:clienteId
GET    /api/membresias/vencidas/lista
POST   /api/membresias
PUT    /api/membresias/:id
DELETE /api/membresias/:id
```

Rutinas:

```text
GET    /api/rutinas
GET    /api/rutinas/:id
GET    /api/rutinas/cliente/:clienteId
POST   /api/rutinas
PUT    /api/rutinas/:id
DELETE /api/rutinas/:id
```

Progreso:

```text
GET    /api/progreso
GET    /api/progreso/:id
GET    /api/progreso/cliente/:clienteId
POST   /api/progreso
PUT    /api/progreso/:id
DELETE /api/progreso/:id
```

Reportes:

```text
GET /api/reportes/resumen
GET /api/reportes/membresias-vencidas
```

Mensajes:

```text
GET    /api/mensajes
POST   /api/mensajes
DELETE /api/mensajes/:id
```

## Funcionalidades Angular incluidas

- Routing con `router-outlet`, `routerLink` y ruta dinamica `/rutinas/:id`.
- Guard basico con localStorage.
- Servicios Angular con HttpClient.
- Observable y `subscribe()`.
- Formularios reactivos en login, usuarios, membresias, rutinas y progreso.
- Formulario template-driven con `[(ngModel)]` en contacto.
- Interpolacion, property binding, event binding, `*ngIf`, `*ngFor` y `[ngClass]`.
- Comunicacion entre componentes con `@Input()` y `@Output()`.
- Pipes `date`, `currency` y `titlecase`.
- Uso de `signal()` en dashboard.

## Verificacion realizada

```bash
cd frontend
npm run build
```

```bash
cd backend
node --check server.js
```
