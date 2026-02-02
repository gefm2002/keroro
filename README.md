# Keroro Store

Tienda online de Kpop, Manga, Anime y Coleccionables.

## Stack

- **Frontend**: Vite + React + TypeScript + TailwindCSS
- **Backend**: Netlify Functions
- **Base de datos**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Deploy**: Netlify

## Setup Local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Supabase

1. Crear un proyecto en [Supabase](https://supabase.com)
2. Ejecutar el schema SQL en el SQL Editor de Supabase:
   - Abrir `supabase/schema.sql`
   - Copiar y pegar todo el contenido
   - Ejecutar en el SQL Editor

3. Crear el bucket de storage:
   - Ir a Storage en Supabase
   - Crear un bucket llamado `keroro_products`
   - Configurarlo como público o con políticas según necesites

### 3. Variables de entorno

Crear un archivo `.env.local` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

Para desarrollo local con Netlify Functions, crear también `.env` en la raíz:

```env
SUPABASE_URL=tu_supabase_url
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
JWT_SECRET=tu_jwt_secret_aleatorio
```

### 4. Ejecutar en desarrollo

```bash
# Desarrollo frontend solamente
npm run dev

# Desarrollo con Netlify Functions (recomendado)
npm run netlify:dev
```

## Deploy a Netlify

### 1. Conectar repositorio

1. Subir el código a GitHub/GitLab/Bitbucket
2. Conectar el repositorio en Netlify

### 2. Configurar variables de entorno

En Netlify, ir a **Site settings > Environment variables** y agregar:

**Variables para el frontend (VITE_*):**
- `VITE_SUPABASE_URL` - URL de tu proyecto Supabase
- `VITE_SUPABASE_ANON_KEY` - Clave anónima de Supabase

**Variables para Netlify Functions (CRÍTICAS):**
- `SUPABASE_URL` - URL de tu proyecto Supabase (mismo que VITE_SUPABASE_URL)
- `SUPABASE_SERVICE_ROLE_KEY` - Clave de servicio de Supabase (⚠️ NO usar la anon key)
- `JWT_SECRET` - Secreto para firmar tokens JWT (generar uno aleatorio y seguro)

⚠️ **IMPORTANTE**: Sin estas variables, las funciones de Netlify (login, admin, etc.) fallarán con error 502.

### 3. Deploy

Netlify detectará automáticamente el build command y public directory desde `netlify.toml`.

## 🔐 Acceso Admin

### URL del Admin
- **Local (desarrollo)**: http://localhost:5173/admin
- **Producción**: https://tu-sitio.netlify.app/admin (después del deploy)

### Credenciales por defecto
```
Email: admin@keroro.store
Password: keroro123
```

⚠️ **IMPORTANTE**: 
- El hash de la contraseña en `schema.sql` es un placeholder. Para generar el hash correcto:
  1. Instalar bcrypt: `npm install bcryptjs`
  2. Ejecutar en Node.js:
     ```js
     const bcrypt = require('bcryptjs');
     console.log(bcrypt.hashSync('keroro123', 10));
     ```
  3. Reemplazar el hash en `schema.sql` antes de ejecutarlo
- **Cambiar la contraseña después del primer login en producción**
- Si usás el script `migrations.sql`, el usuario se creará automáticamente

📄 Ver `CREDENCIALES.md` para más detalles sobre el acceso admin.

## Estructura del proyecto

```
/
├── netlify/
│   └── functions/          # Netlify Functions
│       ├── _lib/           # Librerías compartidas
│       ├── login.ts
│       ├── admin-*.ts      # Endpoints admin
│       └── upload-image.ts
├── public/
│   └── images/             # Imágenes estáticas
├── src/
│   ├── components/         # Componentes React
│   ├── pages/              # Páginas
│   ├── admin/               # Páginas admin
│   ├── utils/               # Utilidades
│   ├── hooks/               # Custom hooks
│   ├── store/               # Estado global
│   └── styles/              # Estilos
├── supabase/
│   └── schema.sql          # Schema de base de datos
└── netlify.toml            # Configuración Netlify
```

## Funcionalidades

### Públicas

- Catálogo de productos con filtros y búsqueda
- Detalle de productos
- Carrito de compras (localStorage)
- Checkout por WhatsApp
- Página de contacto
- FAQs

### Admin

- Login con autenticación propia
- Dashboard con estadísticas
- CRUD de productos, categorías y subcategorías
- Upload de imágenes a Supabase Storage
- Edición de contenido del sitio (hero, promos, pagos, FAQs, contacto)
- Export/Import de inventario en CSV

## Notas importantes

- Las imágenes de productos se suben a Supabase Storage
- El carrito persiste en localStorage
- El checkout se realiza por WhatsApp (no hay pago online)
- Todas las tablas tienen prefijo `keroro_`
- RLS (Row Level Security) está habilitado en Supabase
- Las operaciones admin requieren autenticación JWT

## Soporte

Para más información, contactar a [Structura](https://structura.com.ar/).
