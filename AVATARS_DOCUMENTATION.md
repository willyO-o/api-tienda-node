# Sistema de Avatares - Documentación

## 🎨 Descripción

Sistema automático de generación de avatares para usuarios. Cuando se crea un usuario sin avatar, se genera automáticamente una imagen con:
- La inicial del email (primera letra en mayúscula)
- Color de fondo aleatorio de una paleta de colores vibrantes
- Texto en blanco con sombra

## 📁 Estructura

```
src/
├── common/
│   ├── services/
│   │   └── avatar.service.ts      # Servicio de generación de avatares
│   ├── controllers/
│   │   └── avatars.controller.ts  # Controlador para servir avatares
│   └── common.module.ts           # Módulo común
└── usuarios/
    ├── usuarios.service.ts        # Servicio actualizado con avatar
    └── usuarios.module.ts         # Módulo actualizado
```

## 🚀 Uso

### Crear Usuario con Avatar Automático

**POST** `/usuarios`

```json
{
  "email": "juan@example.com",
  "password": "password123"
}
```

**Respuesta (201)**
```json
{
  "id": 1,
  "email": "juan@example.com",
  "estado": "activo",
  "avatar": "uploads/avatars/avatar-1-1702249234567.png",
  "creado_el": "2025-12-10T12:05:34.000Z"
}
```

### Acceder al Avatar

**GET** `/avatars/avatar-1-1702249234567.png`

Devuelve la imagen PNG del avatar

## 🎨 Características del Servicio

### AvatarService

**Métodos:**

1. **`generateAvatar(email: string, usuarioId: number): Promise<string>`**
   - Genera un avatar con la inicial del email
   - Selecciona color aleatorio de paleta vibrante
   - Guarda el archivo en `uploads/avatars/`
   - Retorna la ruta relativa para almacenar en BD

2. **`deleteAvatar(avatarPath: string): Promise<void>`**
   - Elimina el archivo de avatar anterior
   - Se usa al actualizar el avatar

3. **`getAvatarPath(avatarUrl: string): string | null`**
   - Retorna la ruta absoluta del avatar

## 🎭 Paleta de Colores

El servicio utiliza una paleta de 20 colores vibrantes y distintos:
- Rojo vibrante (#FF6B6B)
- Turquesa (#4ECDC4)
- Azul cielo (#45B7D1)
- Naranja coral (#FFA07A)
- Verde menta (#98D8C8)
- Y más...

## 📦 Paquetes Utilizados

- **canvas**: Para crear las imágenes PNG programáticamente
- **sharp**: Para optimizar las imágenes generadas

## 🛡️ Seguridad

- Validación de rutas para prevenir directory traversal
- Aislamiento de archivos en directorio `uploads/avatars/`
- Nombres de archivo únicos (basados en timestamp y ID)

## 💾 Almacenamiento

Los avatares se guardan en:
```
proyecto/
├── uploads/
│   └── avatars/
│       ├── avatar-1-1702249234567.png
│       ├── avatar-2-1702249234890.png
│       └── ...
```

## 🔄 Flujo de Creación

```
POST /usuarios
  ↓
Validar datos (email único, password válido)
  ↓
Encriptar password (MD5)
  ↓
Guardar usuario en BD
  ↓
¿Avatar viene en la solicitud?
  ├─ SÍ → Usar avatar proporcionado
  └─ NO → Generar avatar automáticamente
        ├─ Crear imagen con inicial
        ├─ Aplicar color aleatorio
        ├─ Optimizar con Sharp
        ├─ Guardar en uploads/avatars/
        └─ Actualizar usuario con ruta
  ↓
Retornar usuario (sin password)
```

## 📝 Notas Importantes

1. Los avatares se generan con dimensiones de 200x200 píxeles
2. Se optimizan automáticamente para reducir tamaño
3. Los archivos se almacenan en el servidor, no en BD
4. Se recomienda hacer backup periódico de la carpeta `uploads/`
5. El directorio `uploads/` se crea automáticamente si no existe

## 🔧 Configuración Adicional

Para servir los avatares en producción:

1. Usar un CDN o servicio de almacenamiento (S3, Azure Blob, etc.)
2. O configurar nginx para servir archivos estáticos desde `uploads/`
3. Considerar usar nombres hash más seguros en lugar de timestamp

## 🚀 Próximas Mejoras Sugeridas

- [ ] Permitir subida personalizada de avatares (multipart/form-data)
- [ ] Redimensionamiento automático de avatares subidos
- [ ] Compresión adicional con WebP
- [ ] Caché de avatares
- [ ] Sincronización con servicios de almacenamiento en la nube
