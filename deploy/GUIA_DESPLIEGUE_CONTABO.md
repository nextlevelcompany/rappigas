# Guía de Despliegue de RappiGas en Servidor Contabo + cPanel

**Subdominio:** `https://rappigas.nextlevel.pe`

---

## 1. En cPanel (Configurar el Subdominio y SSL)

1. Ingresa a tu **cPanel** de `nextlevel.pe`.
2. Ve a la sección **Dominios** > **Crear un nuevo dominio** (o Subdominios).
3. Agrega: `rappigas.nextlevel.pe`.
4. En **Directorio raíz (DocumentRoot)**, te creará una carpeta (por ejemplo: `public_html/rappigas`).
5. Ve a **SSL/TLS Status** en cPanel y asegúrate de que **AutoSSL** (Let's Encrypt o cPanel SSL) genere el certificado HTTPS con el candado verde para `rappigas.nextlevel.pe`.
6. Copia el archivo [.htaccess](file:///C:/Proyectos/RappiGas/deploy/.htaccess) que te preparé dentro de la carpeta del subdominio en cPanel (`public_html/rappigas`).

---

## 2. En el Servidor Contabo (Por SSH como root)

### A. Instalar Java 21 y PostgreSQL (si no los tienes)
```bash
# En Ubuntu / Debian:
apt update && apt install -y openjdk-21-jre postgresql postgresql-contrib

# En AlmaLinux / CentOS / RHEL (cPanel estándar):
dnf install -y java-21-openjdk postgresql-server postgresql-contrib
```

### B. Crear la Base de Datos PostgreSQL
```bash
sudo -u postgres psql
```
Dentro de la consola SQL de Postgres:
```sql
CREATE DATABASE rappigas_db;
CREATE USER rappigas_user WITH PASSWORD 'tu_clave_segura_aqui';
GRANT ALL PRIVILEGES ON DATABASE rappigas_db TO rappigas_user;
\q
```

### C. Subir y arrancar el Backend Spring Boot
1. Crea la carpeta en tu servidor:
   ```bash
   mkdir -p /opt/rappigas
   ```
2. Sube el archivo ejecutable [rappigas-backend.jar](file:///C:/Proyectos/RappiGas/deploy/rappigas-backend.jar) a `/opt/rappigas/`.
3. Sube el archivo [rappigas-backend.service](file:///C:/Proyectos/RappiGas/deploy/rappigas-backend.service) a `/etc/systemd/system/`.
   *(Asegúrate de editar la contraseña de la BD en ese archivo)*.
4. Inicia el servicio 24/7:
   ```bash
   systemctl daemon-reload
   systemctl enable rappigas-backend
   systemctl start rappigas-backend
   ```
5. Comprueba que esté corriendo:
   ```bash
   systemctl status rappigas-backend
   ```

---

## 3. Desplegar el Frontend (Next.js en puerto 3000)

En tu servidor Contabo:
1. Sube la carpeta `frontend/` a `/opt/rappigas/frontend`.
2. Instala dependencias y arranca con PM2 (gestor de procesos Node):
   ```bash
   npm install -g pm2
   cd /opt/rappigas/frontend
   npm install
   npm run build
   pm2 start npm --name "rappigas-frontend" -- start -- -p 3000
   pm2 save
   pm2 startup
   ```

---

## 4. Probar la Aplicación Android

El archivo [RappiGas.apk](file:///C:/Proyectos/RappiGas/RappiGas.apk) ya está compilado apuntando directamente a:
`https://rappigas.nextlevel.pe/auth/login`

Una vez que actives el subdominio en Contabo:
1. Instalas el APK en el celular del repartidor o cliente.
2. Abrirá al instante en `https://rappigas.nextlevel.pe/auth/login`.
3. ¡Funcionará de por vida, 24/7 y desde cualquier lugar!
