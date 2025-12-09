# Guía de Configuración de Migraciones - Módulo de Usuarios

## Descripción

Este proyecto incluye una configuración completa de TypeORM con migraciones para el módulo de usuarios en una base de datos MariaDB.

## Requisitos Previos

- Node.js v18+ instalado
- MariaDB/MySQL instalado y ejecutándose
- npm o yarn como gestor de paquetes

## Estructura de Base de Datos

La tabla `usuarios` contiene los siguientes campos:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT | ID único (clave primaria, autoincrementable) |
| email | VARCHAR(255) | Email del usuario (único, requerido) |
| estado | VARCHAR(50) | Estado del usuario (predeterminado: 'activo') |
| avatar | VARCHAR(500) | URL del avatar (opcional) |
| creado_el | TIMESTAMP | Fecha de creación (predeterminado: CURRENT_TIMESTAMP) |

## Configuración de Variables de Entorno

1. Verifica o actualiza el archivo `.env` en la raíz del proyecto:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_NAME=tienda_db

# Application
PORT=3000
NODE_ENV=development
```

Asegúrate de ajustar estas variables según tu configuración de MariaDB.

## Instalación y Configuración

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Crear la Base de Datos (opcional)

Si aún no has creado la base de datos, puedes hacerlo con:

```bash
mysql -u root -p
CREATE DATABASE tienda_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 3. Ejecutar las Migraciones

```bash
npm run migration:run
```

Este comando:
- Crea la tabla `usuarios` en tu base de datos
- Configura todas las restricciones y índices

## Scripts Disponibles

### Scripts de Desarrollo

```bash
# Iniciar en modo desarrollo (con watch)
npm run start:dev

# Compilar el proyecto
npm run build

# Ejecutar tests
npm test

# Ejecutar tests e2e
npm run test:e2e
```

### Scripts de Migración

```bash
# Ejecutar todas las migraciones pendientes
npm run migration:run

# Revertir la última migración ejecutada
npm run migration:revert

# Generar una nueva migración (después de cambios en entidades)
npm run migration:generate -- -n NombreMigracion
```

## Ejemplo de Datos

Aquí hay un ejemplo de los datos que proporciona la estructura:

```json
{
  "id": 1,
  "email": "administrador@gmail.com",
  "estado": "activo",
  "avatar": "https://example.com/avatar.jpg",
  "creado_el": "2023-10-01T12:00:00Z"
}
```

## Uso de la API

### Crear un Usuario

```bash
curl -X POST http://localhost:3000/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "email": "administrador@gmail.com",
    "estado": "activo",
    "avatar": "https://example.com/avatar.jpg"
  }'
```

### Obtener Todos los Usuarios

```bash
curl http://localhost:3000/usuarios
```

### Obtener un Usuario por ID

```bash
curl http://localhost:3000/usuarios/1
```

### Actualizar un Usuario

```bash
curl -X PUT http://localhost:3000/usuarios/1 \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "inactivo"
  }'
```

### Eliminar un Usuario

```bash
curl -X DELETE http://localhost:3000/usuarios/1
```

## Solución de Problemas

### Error: "Cannot find database"
- Verifica que MariaDB/MySQL está ejecutándose
- Comprueba las credenciales en el archivo `.env`

### Error en la migración
- Asegúrate de haber compilado el proyecto: `npm run build`
- Verifica que el archivo `typeorm.config.ts` existe en la raíz del proyecto

### Errores de conexión
- Revisa que la base de datos existe o créala manualmente
- Verifica los puertos y credenciales en `.env`

## Estructura del Proyecto

```
src/
├── usuarios/
│   ├── entities/
│   │   └── usuario.entity.ts       # Entidad de Usuario
│   ├── usuarios.controller.ts       # Controlador
│   ├── usuarios.service.ts          # Servicio
│   └── usuarios.module.ts           # Módulo
├── database/
│   └── migrations/
│       └── 1701432000000-CreateUsuariosTable.ts  # Primera migración
├── app.module.ts                    # Módulo principal
└── main.ts                          # Punto de entrada
```

## Información Adicional

- **TypeORM Version**: 0.3.28
- **NestJS Version**: 11.0.1
- **Base de Datos**: MySQL/MariaDB
- **Driver**: mysql2

## Próximos Pasos

Para agregar nuevos campos a la tabla `usuarios`:

1. Actualiza la entidad en `src/usuarios/entities/usuario.entity.ts`
2. Crea una nueva migración: `npm run migration:generate -- -n NombreMigracion`
3. Revisa la migración generada en `src/database/migrations/`
4. Ejecuta: `npm run build && npm run migration:run`

## Soporte

Para más información sobre TypeORM, visita: https://typeorm.io
Para más información sobre NestJS, visita: https://nestjs.com
