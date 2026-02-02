# Credenciales de Acceso - Keroro Store

## 🔐 Panel de Administración

### URL de Acceso
- **Local (desarrollo)**: http://localhost:5173/admin
- **Producción**: https://tu-sitio.netlify.app/admin (después del deploy)

### Credenciales por defecto
```
Email: admin@keroro.store
Password: keroro123
```

⚠️ **IMPORTANTE**: 
- Cambiar la contraseña después del primer login en producción
- El hash de la contraseña debe generarse con bcrypt (ver README.md)

## 📋 Funcionalidades del Admin

Una vez logueado, podés acceder a:

- **Dashboard** (`/admin/dashboard`) - Estadísticas generales
- **Productos** (`/admin/productos`) - CRUD completo de productos
- **Categorías** (`/admin/categorias`) - CRUD de categorías con imágenes
- **Contenido** (`/admin/contenido`) - Editar hero, promos, pagos, FAQs, contacto
- **Inventario** (`/admin/inventario`) - Exportar/Importar CSV

## 🔑 Generar Hash de Contraseña

Si necesitás generar un nuevo hash para la contraseña:

```bash
npm install bcryptjs
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('tu-password', 10));"
```

Luego actualizar el hash en `supabase/schema.sql` o `supabase/migrations.sql`
