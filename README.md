# 🚀 CRM System - Sistema de Gestión de Relaciones con Clientes

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-20%2B-green.svg)
![React](https://img.shields.io/badge/react-18.2-61dafb.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.2-blue.svg)

Sistema CRM completo para gestión de leads, contactos, compañías y pipeline de ventas. Desarrollado con tecnologías modernas y diseño profesional.

## 📸 Screenshots

````carousel
![Dashboard principal con métricas clave y visualización del pipeline de ventas](C:/Users/capi/.gemini/antigravity/brain/8eec5e45-3c8c-422e-942c-afcb6a18eb30/crm_dashboard_screenshot_1769717451795.png)
<!-- slide -->
![Gestión de leads con tabla interactiva y formulario lateral](C:/Users/capi/.gemini/antigravity/brain/8eec5e45-3c8c-422e-942c-afcb6a18eb30/crm_leads_page_1769717466439.png)
<!-- slide -->
![Vista Kanban del pipeline de ventas con drag & drop](C:/Users/capi/.gemini/antigravity/brain/8eec5e45-3c8c-422e-942c-afcb6a18eb30/crm_pipeline_view_1769717478822.png)
````

## ✨ Características Principales

### 🎯 Gestión de Leads
- ✅ Pipeline visual con drag & drop
- ✅ Asignación automática de leads
- ✅ Seguimiento de estado y progreso
- ✅ Conversión de leads a oportunidades
- ✅ Notas y actividades relacionadas

### 👥 Gestión de Contactos
- ✅ Perfiles detallados de contactos
- ✅ Asociación con compañías
- ✅ Historial de interacciones
- ✅ Campos personalizables

### 🏢 Gestión de Compañías
- ✅ Información empresarial completa
- ✅ Múltiples contactos por compañía
- ✅ Historial de negocios
- ✅ Notas y actividades

### 📦 Catálogo de Productos
- ✅ Gestión de inventario
- ✅ Precios y ofertas especiales
- ✅ Categorización de productos
- ✅ Control de stock

### 📊 Dashboard y Reportes
- ✅ Métricas en tiempo real
- ✅ Visualización del pipeline
- ✅ Estadísticas de conversión
- ✅ Análisis de rendimiento

### 🔐 Seguridad
- ✅ Autenticación JWT
- ✅ Control de acceso basado en roles
- ✅ Encriptación de contraseñas
- ✅ Rate limiting
- ✅ Helmet para headers HTTP seguros

## 🛠️ Stack Tecnológico

### Frontend
- **Framework:** React 18.2 con TypeScript
- **Build Tool:** Vite
- **Estilos:** Tailwind CSS 3.4
- **Estado:** Redux Toolkit
- **Routing:** React Router v6
- **Formularios:** React Hook Form
- **Animaciones:** Framer Motion
- **Drag & Drop:** @dnd-kit
- **Iconos:** Lucide React
- **HTTP Client:** Axios

### Backend
- **Runtime:** Node.js 20+
- **Framework:** Express.js
- **ORM:** Prisma
- **Base de Datos:** PostgreSQL 15
- **Cache:** Redis 7
- **Autenticación:** JWT
- **Validación:** Zod
- **Seguridad:** Helmet, CORS, Rate Limiting

### DevOps
- **Containerización:** Docker & Docker Compose
- **Base de Datos:** PostgreSQL en contenedor
- **Cache:** Redis en contenedor

## 📋 Prerequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** 20 o superior ([Descargar](https://nodejs.org/))
- **Docker Desktop** ([Descargar](https://www.docker.com/products/docker-desktop))
- **Git** ([Descargar](https://git-scm.com/))
- **npm** o **yarn** (incluido con Node.js)

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/denisgl2008-coder/CRM.git
cd CRM
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la carpeta `server` con las siguientes variables:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/crm_db?schema=public"
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=crm_db

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=tu_secreto_super_seguro_aqui
JWT_EXPIRES_IN=7d

# Redis (opcional)
REDIS_HOST=localhost
REDIS_PORT=6379
```

> **⚠️ Importante:** Cambia `JWT_SECRET` por una cadena aleatoria y segura en producción.

### 3. Iniciar la Infraestructura (PostgreSQL y Redis)

```bash
docker-compose up -d
```

Esto levantará:
- PostgreSQL en el puerto `5432`
- Redis en el puerto `6379`

### 4. Configurar el Backend

```bash
cd server
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

El servidor estará corriendo en `http://localhost:3000`

### 5. Configurar el Frontend

En otra terminal:

```bash
cd client
npm install
npm run dev
```

El cliente estará corriendo en `http://localhost:5173`

## 🎮 Uso

### Acceso a la Aplicación

1. Abre tu navegador en `http://localhost:5173`
2. Regístrate creando una nueva cuenta
3. Inicia sesión con tus credenciales
4. ¡Comienza a usar el CRM!

### Crear tu Primer Lead

1. Ve a la sección **Leads** en el menú lateral
2. Haz clic en **"+ Add Lead"**
3. Completa el formulario con la información del lead
4. Asigna un responsable y selecciona la etapa del pipeline
5. Haz clic en **"Save"**

### Gestionar el Pipeline

1. Ve a la vista de **Pipeline** (vista Kanban)
2. Arrastra y suelta los leads entre las diferentes etapas
3. Las etapas se actualizan automáticamente

## 📡 Documentación de la API

### Base URL
```
http://localhost:3000/api
```

### Autenticación

Todas las rutas (excepto `/auth/login` y `/auth/register`) requieren un token JWT en el header:

```http
Authorization: Bearer <tu_token_jwt>
```

---

### 🔐 Authentication (`/api/auth`)

#### Registro de Usuario
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "contraseña_segura",
  "name": "Juan Pérez",
  "workspaceName": "Mi Empresa"
}
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "usuario@ejemplo.com",
    "name": "Juan Pérez"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "contraseña_segura"
}
```

---

### 📊 Leads (`/api/leads`)

#### Obtener Todos los Leads
```http
GET /api/leads
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` - Filtrar por estado (active, won, lost)
- `assignedTo` - Filtrar por usuario asignado
- `pipelineId` - Filtrar por pipeline

#### Crear un Lead
```http
POST /api/leads
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Oportunidad Cliente XYZ",
  "budget": 50000,
  "currency": "USD",
  "contactId": "uuid-del-contacto",
  "pipelineId": "uuid-del-pipeline",
  "currentStageId": "uuid-de-la-etapa",
  "assignedTo": "uuid-del-usuario",
  "source": "Website"
}
```

#### Actualizar un Lead
```http
PUT /api/leads/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Nombre Actualizado",
  "currentStageId": "nueva-etapa-uuid",
  "budget": 75000
}
```

#### Eliminar un Lead
```http
DELETE /api/leads/:id
Authorization: Bearer <token>
```

---

### 👥 Contacts (`/api/contacts`)

#### Obtener Todos los Contactos
```http
GET /api/contacts
Authorization: Bearer <token>
```

#### Crear un Contacto
```http
POST /api/contacts
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan.perez@empresa.com",
  "phone": "+52 123 456 7890",
  "position": "Director de Compras",
  "companyId": "uuid-de-la-compañia"
}
```

#### Actualizar un Contacto
```http
PUT /api/contacts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "position": "CEO",
  "email": "nuevo.email@empresa.com"
}
```

#### Eliminar un Contacto
```http
DELETE /api/contacts/:id
Authorization: Bearer <token>
```

---

### 🏢 Companies (`/api/companies`)

#### Obtener Todas las Compañías
```http
GET /api/companies
Authorization: Bearer <token>
```

#### Crear una Compañía
```http
POST /api/companies
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Empresa ABC S.A.",
  "email": "contacto@empresaabc.com",
  "phone": "+52 123 456 7890",
  "website": "https://empresaabc.com",
  "address": "Av. Principal 123, Ciudad",
  "industry": "Tecnología",
  "size": "50-200"
}
```

#### Actualizar una Compañía
```http
PUT /api/companies/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Nuevo Nombre S.A.",
  "industry": "Software"
}
```

#### Eliminar una Compañía
```http
DELETE /api/companies/:id
Authorization: Bearer <token>
```

---

### 📦 Products (`/api/products`)

#### Obtener Todos los Productos
```http
GET /api/products
Authorization: Bearer <token>
```

#### Crear un Producto
```http
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "sku": "PROD-001",
  "name": "Producto Premium",
  "description": "Descripción detallada del producto",
  "price": 999.99,
  "currency": "USD",
  "cost": 500.00,
  "category": "Software",
  "stock": 100,
  "isActive": true
}
```

#### Actualizar un Producto
```http
PUT /api/products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "price": 899.99,
  "stock": 150
}
```

#### Eliminar un Producto
```http
DELETE /api/products/:id
Authorization: Bearer <token>
```

---

### 📝 Notes (`/api/notes`)

#### Obtener Notas de una Entidad
```http
GET /api/notes?leadId=uuid
# O
GET /api/notes?contactId=uuid
# O
GET /api/notes?companyId=uuid
Authorization: Bearer <token>
```

#### Crear una Nota
```http
POST /api/notes
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Llamada realizada. Cliente interesado.",
  "type": "user",
  "leadId": "uuid-del-lead"
}
```

---

### 📈 Stats (`/api/stats`)

#### Obtener Estadísticas del Dashboard
```http
GET /api/stats/dashboard
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "totalLeads": 150,
  "activeLeads": 89,
  "wonLeads": 45,
  "lostLeads": 16,
  "conversionRate": 30.0,
  "totalRevenue": 1250000,
  "pipelineDistribution": [
    { "stage": "New", "count": 25 },
    { "stage": "Qualified", "count": 30 }
  ]
}
```

---

### 🔄 Pipelines (`/api/pipelines`)

#### Obtener Todos los Pipelines
```http
GET /api/pipelines
Authorization: Bearer <token>
```

#### Crear un Pipeline
```http
POST /api/pipelines
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Pipeline de Ventas B2B",
  "stages": [
    {
      "name": "Nuevo",
      "type": "new",
      "orderIndex": 0,
      "probability": 10,
      "color": "border-blue-400",
      "bgColor": "bg-blue-50"
    },
    {
      "name": "Calificado",
      "type": "qualified",
      "orderIndex": 1,
      "probability": 25,
      "color": "border-purple-400",
      "bgColor": "bg-purple-50"
    }
  ]
}
```

---

### 👤 Users (`/api/users`)

#### Obtener Todos los Usuarios
```http
GET /api/users
Authorization: Bearer <token>
```

#### Obtener Usuario Actual
```http
GET /api/users/me
Authorization: Bearer <token>
```

---

### 🏥 Health Check
```http
GET /health
```

**Respuesta:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-29T20:00:00.000Z"
}
```

## 📊 Modelo de Datos

### Entidades Principales

```prisma
Workspace (Multi-tenant)
├── Users
├── Leads
│   ├── Contact
│   ├── Pipeline
│   └── PipelineStage
├── Contacts
│   └── Company
├── Companies
├── Products
├── Tasks
├── Notes
├── Messages
├── Files
└── Tags
```

## 🔧 Scripts Disponibles

### Backend (`server/`)
```bash
npm run dev       # Inicia el servidor en modo desarrollo
npm run build     # Compila TypeScript a JavaScript
npm start         # Ejecuta el servidor en producción
npx prisma studio # Abre Prisma Studio para ver la DB
```

### Frontend (`client/`)
```bash
npm run dev       # Inicia el cliente en modo desarrollo
npm run build     # Construye la aplicación para producción
npm run preview   # Preview de la build de producción
npm run lint      # Ejecuta el linter
```

## 🐳 Docker

### Levantar toda la infraestructura
```bash
docker-compose up -d
```

### Ver logs
```bash
docker-compose logs -f
```

### Detener servicios
```bash
docker-compose down
```

### Detener y eliminar volúmenes (⚠️ Borra la base de datos)
```bash
docker-compose down -v
```

## 🧪 Testing

```bash
# Backend (próximamente)
cd server
npm test

# Frontend (próximamente)
cd client
npm test
```

## 🚀 Despliegue en Producción

### Variables de Entorno Recomendadas

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=secreto_ultra_seguro_aleatorio
CORS_ORIGIN=https://tu-dominio.com
```

### Pasos de Despliegue

1. **Backend:**
   - Despliega en plataformas como Heroku, Railway, Render, o DigitalOcean
   - Asegúrate de que PostgreSQL esté configurado
   - Ejecuta las migraciones de Prisma

2. **Frontend:**
   - Build: `npm run build`
   - Despliega en Vercel, Netlify, o Cloudflare Pages
   - Configura la variable `VITE_API_URL` apuntando a tu backend

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📝 Roadmap

- [ ] Tests unitarios y de integración
- [ ] Integración con servicios de email
- [ ] Reportes en PDF
- [ ] Dashboard personalizable
- [ ] Aplicación móvil
- [ ] Integraciones con terceros (Slack, Gmail, etc.)
- [ ] Automatizaciones y workflows
- [ ] Panel de administración avanzado

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Autores

- **Denis GL** - [@denisgl2008-coder](https://github.com/denisgl2008-coder)

## 🙏 Agradecimientos

- React Team por el increíble framework
- Prisma por el excelente ORM
- La comunidad de código abierto

---

**⭐ Si este proyecto te fue útil, considera darle una estrella en GitHub!**

🔗 **Links:**
- [Repositorio](https://github.com/denisgl2008-coder/CRM)
- [Reportar Bug](https://github.com/denisgl2008-coder/CRM/issues)
- [Solicitar Feature](https://github.com/denisgl2008-coder/CRM/issues)
