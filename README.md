# DevNotes: API y Gestor de Notas con Next.js, PostgreSQL y Coolify

Aplicación web para gestión de notas técnicas y bitácoras de desarrollo, construida con Next.js y conectada a una base de datos PostgreSQL provisionada de forma nativa e independiente mediante la plataforma *self-hosted* Coolify.

El proyecto implementa una API REST con operaciones CRUD, almacenamiento relacional directo y un panel interactivo que incluye una consola de depuración de solicitudes HTTP en tiempo real.

Este repositorio servirá como guía práctica integral para aprender a instalar, configurar y operar **Coolify** (una alternativa de código abierto y autoalojada a plataformas PaaS como Vercel o Heroku) sobre cualquier entorno Linux (VPS, servidor dedicado, máquina virtual o WSL2 con Docker).

# 1. Descripción del proyecto

La aplicación **DevNotes** permite centralizar apuntes, fragmentos de código y registros de trabajo mediante las siguientes operaciones:

* Consultar notas almacenadas en la base de datos relacional.

* Crear nuevas notas categorizadas.

* Modificar el título, contenido o categoría de notas existentes.

* Eliminar notas obsoletas.

* Inspeccionar en tiempo real el tráfico HTTP de la API (métodos, códigos de estado, latencias y cargas útiles).

### Arquitectura de ejecución local

En el entorno de desarrollo del alumno, la aplicación se conecta a una base de datos PostgreSQL local o remota a través de variables de entorno:

```
Usuario / Navegador
        │
        ▼
Aplicación Next.js (localhost:3000)
        │
        ▼
    API REST interna (/api/notas)
        │
        ▼
Conexión directa PostgreSQL (pg pool)
        │
        ▼
  Base de Datos Relacional

```

### Arquitectura de producción en Coolify (Self-Hosted PaaS)

A diferencia de proveedores de nube centralizados, Coolify orquesta servicios directamente sobre el motor de contenedores de tu propio servidor (o entorno local), administrando automáticamente el proxy inverso (Traefik), la red interna y los certificados SSL:

```
                     Internet / Red Local
                              │
                              ▼
           ┌──────────────────────────────────────┐
           │     Servidor con Coolify (Docker)    │
           │                                      │
           │     Proxy Inverso (Traefik)          │
           │     Puertos 80 / 443 / sslip.io      │
           │              │                       │
           │       Red interna Docker             │
           │         ┌────┴────────────┐          │
           │         ▼                 ▼          │
           │  Contenedor App     Contenedor BD    │
           │   (Next.js Node)    (PostgreSQL)     │
           └──────────────────────────────────────┘
                              ▲
                              │ Git Push / Webhook
                     Repositorio GitHub

```

# 2. Tecnologías utilizadas

| Tecnología | Función | 
| ----- | ----- | 
| Next.js (App Router) | Framework full-stack para la interfaz de usuario y las rutas de la API REST | 
| Node.js 20+ | Entorno de ejecución en servidor | 
| PostgreSQL | Motor de base de datos relacional para la persistencia de las notas | 
| Coolify | Plataforma PaaS autoalojada (*Self-Hosted*) para orquestar contenedores y despliegues | 
| Docker & Docker Compose | Motor de virtualización subyacente gestionado por Coolify | 
| Traefik | Proxy inverso y enrutador dinámico integrado dentro del ecosistema de Coolify | 
| Git y GitHub | Control de versiones y disparador de integración continua (CI/CD) | 

# 3. Estructura del proyecto

La estructura de archivos del proyecto es la siguiente:

```
DevNotes_Coolify/
├── app/
│   ├── page.js                     # Interfaz de usuario y consola de peticiones HTTP
│   ├── layout.js                   # Estructura HTML base y estilos globales
│   ├── globals.css                 # Reglas de diseño y utilidades visuales
│   └── api/
│       ├── salud/
│       │   └── route.js            # Comprobación de estado y conectividad con PostgreSQL
│       └── notas/
│           ├── route.js            # Endpoints GET (listar) y POST (crear)
│           └── [id]/
│               └── route.js        # Endpoints PUT (actualizar) y DELETE (eliminar)
├── lib/
│   └── db.js                       # Configuración del pool de conexiones a PostgreSQL
├── scripts/
│   └── init.sql                    # Script DDL de inicialización de tablas y datos semilla
├── .env.example                    # Plantilla de variables de entorno requeridas
├── Dockerfile                      # Archivo de construcción opcional / Nixpacks automático
├── package.json                    # Dependencias y scripts de ejecución
└── README.md                       # Guía de la práctica

```

### Archivos principales

| Archivo | Función | 
| ----- | ----- | 
| `app/page.js` | Vista principal con formulario de notas, tarjetas de datos y consola de peticiones | 
| `app/api/salud/route.js` | Ruta para verificar la latencia y conexión activa a PostgreSQL | 
| `app/api/notas/route.js` | Maneja la obtención de la lista completa y la inserción de registros | 
| `app/api/notas/[id]/route.js` | Permite actualizar campos o eliminar una nota específica mediante su identificador | 
| `lib/db.js` | Administra el cliente de PostgreSQL (`pg`) con reconexión automática | 
| `scripts/init.sql` | Sentencias SQL para crear la tabla `notas` e insertar los registros de prueba | 
| `.env.example` | Muestra la convención de la cadena de conexión `DATABASE_URL` | 

# 4. Requisitos previos

Antes de comenzar la práctica, verifica que tu equipo cuente con las siguientes herramientas instaladas:

* Node.js versión 20 o superior.

* NPM versión 10 o superior.

* Git.

* Un editor de código (por ejemplo, Visual Studio Code).

* Una cuenta activa en **GitHub**.

### Requisitos para ejecutar Coolify

Coolify es un sistema autoalojado (*self-hosted*). Para ejecutarlo necesitas una máquina con arquitectura x86_64 o ARM64 que disponga de **al menos 2 núcleos de CPU, 2 GB de memoria RAM y 20 GB de espacio libre en disco**.

Puedes usar cualquiera de las siguientes opciones según tu sistema operativo:

1. **Linux Bare-Metal o VPS (Recomendado):** Servidor Ubuntu 22.04 / 24.04 (en servicios como Hetzner, DigitalOcean, Oracle Cloud, Linode o una máquina local).

2. **Windows:** WSL2 (Subsistema de Windows para Linux) con distribución Ubuntu instalada.

3. **macOS / Linux Desktop:** Docker Desktop o motor Docker nativo activo.

Verifica tus herramientas locales en la terminal:

```
node --version
npm --version
git --version
docker --version

```

# 5. Preparación del entorno local

Antes de realizar el despliegue en Coolify, se debe configurar y probar el funcionamiento de la aplicación en el entorno de desarrollo local.

## 5.1 Clonar el repositorio base

Clona el repositorio de la práctica:

```
git clone https://github.com/PatoHacker458/expo_coolify.git

```

Ingresa al directorio de trabajo:

```
cd expo_coolify

```

Instala las dependencias del proyecto:

```
npm install

```

## 5.2 Configurar la base de datos local

Para probar la aplicación en tu computadora antes de desplegarla en Coolify, puedes utilizar un contenedor Docker temporal de PostgreSQL o una base de datos local.

### Ejecución de PostgreSQL local mediante Docker:

```
docker run --name devnotes-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgrespassword \
  -e POSTGRES_DB=devnotes \
  -p 5432:5432 \
  -d postgres:16-alpine

```

### Inicialización de las tablas

Ejecuta el script SQL para crear la tabla de notas y los registros iniciales:

```
docker exec -i devnotes-postgres psql -U postgres -d devnotes < scripts/init.sql

```

Si prefieres ejecutar las sentencias de forma manual, el script `scripts/init.sql` contiene:

```
create table if not exists notas (
  id serial primary key,
  titulo varchar(255) not null,
  contenido text not null,
  categoria varchar(50) default 'General',
  created_at timestamp with time zone default current_timestamp
);

insert into notas (titulo, contenido, categoria)
values
('Instalar Coolify', 'Explorar la arquitectura de contenedores y PaaS autoalojada.', 'Infraestructura'),
('Configurar PostgreSQL', 'Probar persistencia y conexiones internas de Docker.', 'Base de Datos');

```

## 5.3 Configurar las variables de entorno locales

En la raíz del proyecto encontrarás el archivo de ejemplo `.env.example`. Crea una copia con el nombre `.env.local`:

### Windows PowerShell

```
copy .env.example .env.local

```

### Linux, WSL o macOS

```
cp .env.example .env.local

```

Abre `.env.local` y define la cadena de conexión:

```
DATABASE_URL=postgresql://postgres:postgrespassword@localhost:5432/devnotes

```

Guarda los cambios. El archivo `.env.local` está incluido en `.gitignore` para no exponer credenciales al repositorio público.

## 5.4 Ejecutar y verificar la aplicación en local

Inicia el servidor de desarrollo:

```
npm run dev

```

Abre tu navegador web en:

```
http://localhost:3000

```

Si la conexión con la base de datos es exitosa, se mostrarán las dos notas registradas inicialmente:

1. *Instalar Coolify*

2. *Configurar PostgreSQL*

# 6. Funcionamiento de la API REST

La aplicación expone una API REST bajo el prefijo `/api` para todas las operaciones CRUD.

| Método | Endpoint | Descripción | Cuerpo de la solicitud (Payload) | 
| ----- | ----- | ----- | ----- | 
| GET | `/api/salud` | Diagnóstico de latencia y estado con PostgreSQL | *Ninguno* | 
| GET | `/api/notas` | Retorna la colección completa de notas | *Ninguno* | 
| POST | `/api/notas` | Registra una nueva nota | JSON: `{"titulo": "...", "contenido": "...", "categoria": "..."}` | 
| PUT | `/api/notas/:id` | Modifica una nota existente | JSON: `{"titulo": "...", "contenido": "...", "categoria": "..."}` | 
| DELETE | `/api/notas/:id` | Elimina una nota por su ID numérico | *Ninguno* | 

### Ejemplos de prueba desde la terminal

#### Crear una nota:

```
curl -X POST http://localhost:3000/api/notas \
  -H "Content-Type: application/json" \
  -d '{"titulo": "Aprender Docker", "contenido": "Revisar redes y volúmenes", "categoria": "DevOps"}'

```

#### Actualizar una nota existente (por ejemplo, ID 1):

```
curl -X PUT http://localhost:3000/api/notas/1 \
  -H "Content-Type: application/json" \
  -d '{"titulo": "Instalar Coolify v4", "contenido": "Completar la instalación local y configurar el panel", "categoria": "DevOps"}'

```

#### Eliminar una nota (por ejemplo, ID 2):

```
curl -X DELETE http://localhost:3000/api/notas/2

```

# 7. Interfaz gráfica y consola de depuración

La interfaz de usuario incluye dos áreas de trabajo:

1. **Gestor de Notas:** Permite registrar notas con título, contenido y categoría, además de editarlas en línea o eliminarlas con un solo clic.

2. **Consola de Tráfico HTTP:** Ubicada en la parte inferior, intercepta y registra cada solicitud enviada a la API interna, documentando:

   * Marca de tiempo precisa.

   * Verbo HTTP (`GET`, `POST`, `PUT`, `DELETE`).

   * Ruta relativa consultada.

   * Código de respuesta HTTP (`200 OK`, `201 Created`, etc.).

   * Tiempo de respuesta en milisegundos.

   * Carga enviada (`Payload`) y cuerpo devuelto por el servidor (`Response`).

# Práctica: Despliegue de Aplicación y Base de Datos con Coolify

# 8. Objetivo de la práctica

Comprender y dominar el despliegue de soluciones full-stack en entornos autoalojados utilizando **Coolify**, desacoplándose de nubes comerciales propietarias y manteniendo el control de la infraestructura mediante contenedores Docker.

Al finalizar la práctica se habrán cubierto los siguientes conceptos:

* Instalación y puesta en marcha de un panel PaaS autoalojado (*Self-Hosted*).

* Provisionamiento de bases de datos relacionales en contenedores gestionados con almacenamiento persistente.

* Orquestación de aplicaciones web con compilación automatizada (Nixpacks / Docker).

* Configuración de redes internas de Docker para comunicación privada entre servicios.

* Manejo de variables de entorno seguras en producción.

* Automatización de despliegues continuos (*Continuous Deployment*) mediante webhooks o integración con GitHub.

# 9. Comprobar la aplicación antes del despliegue

Antes de comenzar la instalación de Coolify, comprueba que tu entorno local funcione sin errores:

1. Inicia la aplicación con `npm run dev`.

2. Accede a `http://localhost:3000`.

3. Crea una nueva nota con el título:

   ```
   Verificación local previa al despliegue
   
   ```

4. Observa cómo la consola inferior registra la solicitud `POST /api/notas` y el posterior refresco con `GET /api/notas`.

> ### 📷 Evidencia 1
>
> Tomar una captura de pantalla donde se observe:
>
> * El navegador en `http://localhost:3000`.
>
> * La nota *Verificación local previa al despliegue* visible en la interfaz.
>
> * La consola inferior mostrando las peticiones HTTP exitosas (código 200 o 201).

# 10. Instalación y configuración de Coolify

Coolify provee un script de instalación general compatible con cualquier distribución Linux basada en Debian/Ubuntu (en VPS, bare-metal o WSL2 en Windows).

## 10.1 Ejecución del script de instalación

Abre una terminal con privilegios de administrador (`sudo` o `root`) en tu máquina Linux o WSL2 y ejecuta:

```
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash

```

El script verificará e instalará automáticamente:

* Dependencias de sistema (`curl`, `socat`, etc.).

* Motor de Docker y Docker Compose (si no estaban presentes).

* Los contenedores del núcleo de Coolify (base de datos SQLite/PostgreSQL de control, panel web, worker y el proxy inverso Traefik).

Espera a que el instalador finalice indicando que Coolify está listo.

## 10.2 Acceso al panel de control de Coolify

Abre tu navegador e ingresa a:

```
http://localhost:8000

```

*(Si estás usando un servidor VPS remoto, sustituye `localhost` por la dirección IP pública de tu servidor, por ejemplo `http://192.0.2.1:8000`)*.

1. **Registro inicial:** Completa el formulario de bienvenida creando tu cuenta de administrador (nombre, correo electrónico y contraseña).

2. **Configuración de origen:** Selecciona la opción predeterminada para gestionar el servidor local (*Localhost / This Server*).

> ### 📷 Evidencia 2
>
> Tomar una captura de pantalla del panel principal de Coolify (*Dashboard*) tras haber iniciado sesión exitosamente como administrador, mostrando el servidor local en estado activo (*Healthy / Running*).

# 11. Crear un repositorio propio en GitHub

Cada alumno deberá trabajar con su propio repositorio remoto para vincularlo a Coolify.

1. Verifica la configuración remota actual en tu proyecto local:

   ```
   git remote -v
   
   ```

2. Desvincula el repositorio original de la práctica:

   ```
   git remote remove origin
   
   ```

3. Crea un nuevo repositorio público o privado en tu cuenta personal de **GitHub** con el nombre:

   ```
   practica-coolify
   
   ```

   *(No inicialices el repositorio con README, `.gitignore` ni licencias).*

4. Conecta tu repositorio local con tu nuevo origen en GitHub:

   ```
   git remote add origin https://github.com/TU-USUARIO/practica-coolify.git
   git branch -M main
   git push -u origin main
   
   ```

> ### 📷 Evidencia 3
>
> Tomar una captura de pantalla de tu repositorio personal en GitHub mostrando las carpetas y archivos del proyecto subidos en la rama `main`.

# 12. Provisionar la base de datos PostgreSQL en Coolify

Una de las grandes ventajas de Coolify frente a plataformas como Vercel es que permite alojar la base de datos dentro del mismo servidor con persistencia de volúmenes Docker gestionada.

1. En el menú lateral de Coolify, haz clic en **Projects** y entra al proyecto predeterminado (o crea uno nuevo llamado `Practica-Coolify`).

2. Entra al entorno **Production** y pulsa en **+ New Resource**.

3. Selecciona **Databases** y elige **PostgreSQL**.

4. En el asistente:

   * **Name:** `devnotes-db`

   * **Database Name:** `devnotes`

   * **User:** `postgres`

   * Define o permite que Coolify genere una contraseña segura.

5. Haz clic en **Deploy**. Coolify descargará la imagen de PostgreSQL y levantará el contenedor.

6. Una vez desplegado, revisa la sección **Network**:

   * Copia la **Internal Database URL** (esta URL utiliza la red interna de Docker, por ejemplo: `postgresql://postgres:password@devnotes-db:5432/devnotes` o similar). Esta conexión no viaja por internet, lo que garantiza máxima velocidad y seguridad.

### Inicializar el esquema en la base de datos de Coolify

Entra a la pestaña **Execute / Terminal** de tu recurso PostgreSQL en Coolify (o usa el botón de base de datos) y ejecuta las instrucciones DDL del archivo `scripts/init.sql` para crear la tabla `notas` y los datos iniciales.

> ### 📷 Evidencia 4
>
> Tomar una captura de pantalla en Coolify donde se observe el recurso de PostgreSQL con estado verde (*Running / Healthy*) y la pestaña de configuración general mostrando el nombre de la base de datos `devnotes`.

# 13. Desplegar la aplicación en Coolify

Ahora conectaremos el repositorio de GitHub con Coolify para compilar y ejecutar el servicio web.

1. En el mismo proyecto donde creaste la base de datos, pulsa en **+ New Resource**.

2. Selecciona **Public Repository** (o GitHub App si configuraste la integración oficial).

3. Introduce la URL de tu repositorio personal de GitHub:

   ```
   https://github.com/TU-USUARIO/practica-coolify
   
   ```

4. En la rama (*Branch*), indica `main`.

5. Coolify detectará el proyecto. Selecciona **Nixpacks** (o Dockerfile) como método de construcción (*Build Pack*).

6. En la pestaña **Configuration**:

   * **Ports Exposes:** Define el puerto `3000`.

   * **Domains:** Puedes asignar un dominio temporal automático provisto por Coolify (utilizando `sslip.io`, por ejemplo `http://app.127.0.0.1.sslip.io` o tu IP con sslip.io).

## 13.1 Configurar las variables de entorno en Coolify

En la pestaña **Environment Variables** del recurso de la aplicación, agrega la variable:

```
DATABASE_URL

```

Asigna como valor la **Internal Database URL** obtenida en el paso anterior de PostgreSQL.

> **Importante:** Al encontrarse ambos contenedores en la misma red de Docker gestionada por Coolify, la aplicación se comunicará directamente con PostgreSQL a través del nombre de host interno sin exponer la base de datos al exterior.

## 13.2 Realizar el primer despliegue

Haz clic en el botón superior **Deploy**.

Dirígete a la pestaña **Deployments** para observar los registros de construcción en tiempo real:

```
Cloning repository...
Building container with Nixpacks...
Configuring Traefik reverse proxy...
Application status: Running

```

> ### 📷 Evidencia 5
>
> Tomar una captura de pantalla de la pestaña de despliegues (*Deployments*) de Coolify mostrando que el primer despliegue finalizó de forma exitosa con estado *Success / Finished*.

# 14. Comprobar la aplicación en producción

1. Haz clic en el enlace del dominio configurado en Coolify (o accede mediante la URL asignada con `sslip.io`).

2. Verifica que cargue la interfaz de **DevNotes**.

3. Comprueba que las notas iniciales cargadas desde la base de datos PostgreSQL de Coolify se visualicen en la pantalla.

4. Agrega una nueva nota desde la interfaz web:

   * **Título:** `Despliegue exitoso en Coolify`

   * **Contenido:** `Aplicación y base de datos corriendo en contenedores independientes`

   * **Categoría:** `Infraestructura`

> ### 📷 Evidencia 6
>
> Tomar una captura de pantalla del navegador web mostrando la aplicación funcionando a través de la URL de Coolify, con la nueva nota creada visible y la URL claramente identificable en la barra de direcciones.

# 15. Configurar Continuous Deployment (Despliegue Continuo)

A continuación, validaremos el flujo automatizado: realizar un cambio en el código, enviarlo a GitHub y verificar que Coolify recompile y despliegue la nueva versión de manera automática.

## 15.1 Configurar el Webhook en GitHub

1. En la configuración de tu aplicación en Coolify, busca la sección **Webhooks**.

2. Copia la URL del **Deploy Webhook**.

3. Dirígete a tu repositorio en GitHub y haz clic en:

   ```
   Settings > Webhooks > Add webhook
   
   ```

4. Pega la URL en **Payload URL**, selecciona `application/json` en **Content type** y deja el evento en *Just the push event*.

5. Guarda el webhook.

## 15.2 Realizar una modificación en el código

Regresa a tu editor de código local.

1. Crea una nueva rama de trabajo:

   ```
   git checkout -b cambio-estilo
   
   ```

2. Abre el archivo:

   ```
   app/page.js
   
   ```

3. Modifica el encabezado principal de la aplicación para agregar tu nombre completo:

   ```
   // Modificar el título principal
   <h1 className="text-3xl font-bold">
     DevNotes - Práctica Coolify de [Tu Nombre y Apellidos]
   </h1>
   
   ```

4. Guarda el archivo, comprueba los cambios y realiza el commit:

   ```
   git add .
   git commit -m "Personalizar encabezado de la aplicación"
   
   ```

5. Fusiona los cambios a la rama `main` y súbelos a GitHub:

   ```
   git checkout main
   git merge cambio-estilo
   git push origin main
   
   ```

## 15.3 Inspección del despliegue automático

No oprimas ningún botón en Coolify. Abre la pestaña **Deployments** de tu aplicación en Coolify y comprueba que se haya disparado automáticamente una nueva tarea de compilación provocada por el Webhook de GitHub.

> ### 📷 Evidencia 7
>
> Tomar una captura de pantalla en Coolify donde se observe el despliegue automático en proceso o finalizado con éxito, indicando el mensaje del commit: *"Personalizar encabezado de la aplicación"*.

# 16. Verificar la persistencia de datos y contenedores

Una característica esencial de Coolify frente a arquitecturas serverless es que los datos y los contenedores mantienen su ciclo de vida y volúmenes montados.

1. Abre nuevamente la aplicación en producción (deberás ver tu nombre en el encabezado actualizado).

2. Agrega una nueva nota con el texto:

   ```
   Persistencia validada tras CI/CD
   
   ```

3. Regresa a Coolify y accede a la base de datos `devnotes-db`.

4. Ve a la pestaña de terminal o ejecuta una consulta para verificar los registros:

   ```
   select id, titulo, categoria from notas order by id desc limit 3;
   
   ```

5. Comprueba que la nota creada antes de la actualización y la nota creada después sigan existiendo intactas.

> ### 📷 Evidencia 8
>
> Tomar una captura de pantalla de los registros de la base de datos o de la terminal del contenedor en Coolify donde se verifique que la tabla `notas` contiene los registros almacenados antes y después del despliegue automático.

# 17. Resultado esperado

Al finalizar la práctica se deben haber alcanzado los siguientes objetivos:

| Componente | Estado esperado | 
| ----- | ----- | 
| Instalación local de la aplicación | Funcional con Node.js y PostgreSQL | 
| Servidor Coolify | Activo en puerto 8000 con proxy Traefik operativo | 
| Base de Datos PostgreSQL en Coolify | En ejecución en red interna con persistencia | 
| Despliegue de la Aplicación | Compilada y en ejecución mediante contenedor Docker | 
| Variables de entorno de producción | Conectadas vía `DATABASE_URL` privada | 
| Continuous Deployment (CI/CD) | Automatizado mediante Webhook de GitHub al hacer `push` a `main` | 
| Persistencia de datos | Garantizada a través de volúmenes de Docker gestionados | 

### Flujo integral de la solución

```
DESARROLLO Y ENTREGA CONTINUA

Desarrollador
     │
     │ git push origin main
     ▼
Repositorio GitHub
     │
     │ Webhook HTTP POST
     ▼
Coolify Server (Puerto 8000)
     │
     │ 1. Git pull automático
     │ 2. Nixpacks Build
     │ 3. Recarga sin caída de servicio (Zero-downtime)
     ▼
Contenedor Next.js Actualizado


INFRAESTRUCTURA Y SERVICIO

Cliente Web
     │
     ▼
Traefik Reverse Proxy (Puerto 80/443)
     │
     ▼
Contenedor Aplicación (Next.js :3000)
     │
     │ Conexión interna Docker (Red coolify)
     ▼
Contenedor PostgreSQL (devnotes-db :5432)
     │
     ▼
Volumen persistente montado en disco (/var/lib/postgresql/data)

```

# 18. Resumen de evidencias requeridas

Para acreditar la práctica se deberán incluir las siguientes 8 capturas en el reporte final:

| No. | Evidencia requerida | 
| ----- | ----- | 
| **1** | Aplicación ejecutándose en `localhost:3000` con la consola de peticiones activa | 
| **2** | Dashboard principal de Coolify activo tras la instalación inicial del administrador | 
| **3** | Repositorio personal publicado en GitHub con la estructura de archivos del proyecto | 
| **4** | Recurso de PostgreSQL en Coolify en estado activo (*Healthy / Running*) | 
| **5** | Primer despliegue completado con éxito en el panel de eventos de Coolify | 
| **6** | Aplicación web funcionando en producción bajo la URL de Coolify | 
| **7** | Despliegue automático ejecutado por el Webhook de GitHub tras el `git push` | 
| **8** | Consulta o vista en base de datos demostrando la persistencia de las notas creadas | 

# 19. Formato del entregable

Elaborar un reporte en formato **PDF** que contenga los siguientes apartados:

1. **Portada:** Datos de la institución, materia, nombre del profesor, nombre completo del alumno y fecha.

2. **Objetivo:** Definición de la meta técnica de la práctica.

3. **Introducción:** Breve explicación teórica sobre Coolify, diferencias frente a modelos PaaS comerciales (Vercel, Render) y ventajas del autoalojamiento (*Self-Hosting*).

4. **Desarrollo:** Bitácora descriptiva de los pasos realizados para la instalación y despliegue.

5. **Sección de Evidencias:** Las 8 capturas solicitadas, presentadas en orden, nítidas y con una breve descripción explicativa al pie de cada una.

6. **Conclusiones personales:** Análisis sobre la experiencia de instalar y gestionar tu propia infraestructura.

7. **Enlaces:**

   * Enlace al repositorio personal en GitHub.

   * Enlace o dirección de acceso a la instancia desplegada.

# 20. Resolución de problemas comunes (Troubleshooting)

| Problema | Causa probable | Solución sugerida | 
| ----- | ----- | ----- | 
| El script de Coolify falla al instalar | Docker no tiene permisos o los puertos 80/443/8000 están ocupados | Comprueba que ningún servidor web (Apache, Nginx, IIS) esté corriendo en el sistema con `sudo netstat -tulpn` y vuelve a correr el script. | 
| La aplicación indica `Connection Refused` hacia la base de datos | Se utilizó `localhost` en la variable de entorno de Coolify | En Coolify, dos contenedores no se comunican por `localhost`. Debes usar la URL de la red interna de Docker provista en la pestaña de PostgreSQL (ej. `devnotes-db`). | 
| Error al resolver el dominio con `sslip.io` | La máquina no tiene salida a resolución DNS pública o el firewall bloquea el puerto 80 | Comprueba la configuración de DNS del sistema (`8.8.8.8` / `1.1.1.1`) o asigna manualmente una IP fija en la configuración de Traefik. | 
| El contenedor de Next.js se queda sin memoria durante el build | El servidor o la máquina virtual tiene menos de 2 GB de RAM | Habilita un archivo de intercambio (*Swap*) en Linux: `sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile`. | 
| El Webhook de GitHub no dispara el despliegue | La URL de Coolify es `localhost` y GitHub no puede alcanzar tu máquina | Si Coolify está en una máquina local sin IP pública, utiliza una herramienta de túnel seguro como Cloudflare Tunnels, Ngrok o simula el push con el botón manual de despliegue documentándolo en el reporte. | 
| Las modificaciones en `app/page.js` no se reflejan en producción | La caché del navegador está activa o la compilación usó una capa previa | Pulsa `Ctrl + F5` para forzar la recarga sin caché o haz clic en **Force Redeploy** dentro de Coolify. | 

# 21. Seguridad y buenas prácticas

* **Protección de credenciales:** Nunca almacenes contraseñas en texto plano dentro de archivos commiteados en Git. Utiliza siempre la sección **Environment Variables** de Coolify.

* **Acceso al puerto 8000:** En entornos de producción reales en internet, no dejes el puerto `8000` de administración expuesto abiertamente sin un cortafuegos (*firewall*) restrictivo (como UFW) o una VPN (como Tailscale o WireGuard).

* **Copias de seguridad:** Coolify cuenta con una función nativa de respaldos automatizados para PostgreSQL hacia almacenamiento S3; se recomienda habilitarla en proyectos productivos.

# 22. Referencias

* Sitio web oficial de Coolify: https://coolify.io/

* Documentación oficial de Coolify: https://coolify.io/docs

* Repositorio de Coolify en GitHub: https://github.com/coollabsio/coolify

* Documentación de Next.js (App Router): https://nextjs.org/docs

* Documentación del motor PostgreSQL: https://www.postgresql.org/docs/

* Documentación de Traefik Proxy: https://doc.traefik.io/traefik/