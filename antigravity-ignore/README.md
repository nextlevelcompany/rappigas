# Carpeta Antigravity Ignore (`antigravity-ignore`)

Esta carpeta y los archivos de configuración `.agyignore` / `.antigravityignore` definen **todo lo que Antigravity NO debe analizar, escanear ni procesar** en este proyecto.

---

## 🚫 Archivos y Directorios Ignorados Automáticamente

### 1. Dependencias y Paquetes de Terceros
- `node_modules/`, `frontend/node_modules/`, `backend/node_modules/`
- `tools/`
- `package-lock.json`

### 2. Salidas de Compilación y Empaquetado
- `frontend/.next/` (Builds y chunks temporales de Next.js)
- `backend/target/` (Binarios Java, clases compiladas `.class`, `.jar`, `.war`)
- `dist/`, `build/`, `out/`
- `*.tsbuildinfo`

### 3. Archivos Pesados, Documentos y Binarios
- `uploads/` (Imágenes subidas por usuarios o repartidores)
- `*.docx`, `~$*.docx` (Documentación pesada en formato Word)
- `*.pdf`, `*.xlsx`
- Archivos comprimidos: `*.zip`, `*.tar`, `*.gz`, `*.rar`, `*.7z`

### 4. Variables de Entorno y Secretos
- `.env`, `.env.local`, `.env.*.local`
- Llaves privadas y certificados: `*.pem`, `*.key`

### 5. Control de Versiones, IDEs y Sistema Operativo
- `.git/`, `.github/`
- `.vscode/`, `.idea/`
- `.DS_Store`, `Thumbs.db`

### 6. Logs, Depuración y Cobertura
- `*.log`, `logs/`
- `coverage/`, `.nyc_output/`, `.cache/`

---

## 💡 ¿Cómo usar esta carpeta?
Si tienes archivos, reportes, imágenes temporales o código de prueba que **no deseas que el asistente Antigravity analice**, puedes colocarlos directamente dentro de esta carpeta `antigravity-ignore/`.
