// ============================================================
// CLASSROOM ORGANIZER — script.js
// Creado por: Raúl Poblete Illescas
// ============================================================

const CLIENT_ID = '318424227146-kdgsb56tsrhff3ulibqqhet463kobokr.apps.googleusercontent.com';
const SCOPES    = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.students.readonly',
  'https://www.googleapis.com/auth/classroom.announcements.readonly'
].join(' ');

let accessToken   = null;
let scriptContent = '';
let cursosData    = [];

// ── Helpers de log ────────────────────────────────────────
function log(id, msg, type = 'ok') {
  const el = document.getElementById(id);
  el.classList.add('visible');
  const line = document.createElement('div');
  line.className = 'log-line ' + type;
  line.textContent = msg;
  el.appendChild(line);
}

function clearLog(id) {
  const el = document.getElementById(id);
  el.innerHTML = '';
  el.classList.remove('visible');
}

// ── Desbloquear paso ──────────────────────────────────────
function desbloquear(stepId) {
  const el = document.getElementById(stepId);
  el.classList.remove('locked');
  el.classList.add('unlocked');
  // Quitar el candado del terminal-bar
  const lock = el.querySelector('.lock-icon');
  if (lock) lock.remove();
}

// ── PASO 1: Login con Google ──────────────────────────────
function iniciarLogin() {
  const btn = document.getElementById('btnLogin');
  btn.disabled = true;
  clearLog('logLogin');
  log('logLogin', '> Iniciando autenticación con Google...', 'info');

  // Usamos Google Identity Services (token model)
  const client = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (response) => {
      if (response.error) {
        log('logLogin', '✗ Error de autenticación: ' + response.error, 'err');
        btn.disabled = false;
        return;
      }
      accessToken = response.access_token;
      log('logLogin', '✓ Sesión iniciada correctamente.');
      btn.disabled = false;
      btn.textContent = '✓ sesión iniciada';
      cargarCursos();
    }
  });

  client.requestAccessToken();
}

// ── PASO 2: Cargar cursos desde Classroom API ─────────────
async function cargarCursos() {
  desbloquear('step2');
  clearLog('logCursos');
  log('logCursos', '> Cargando tus cursos de Classroom...', 'info');

  try {
    const res = await fetch(
      'https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE&pageSize=20',
      { headers: { Authorization: 'Bearer ' + accessToken } }
    );

    if (!res.ok) {
      const err = await res.json();
      log('logCursos', '✗ Error al obtener cursos: ' + (err.error?.message || res.status), 'err');
      return;
    }

    const data = await res.json();
    cursosData = data.courses || [];

    if (cursosData.length === 0) {
      log('logCursos', '⚠ No se encontraron cursos activos en tu cuenta.', 'info');
      return;
    }

    // Rellenar el select
    const select = document.getElementById('selectCurso');
    select.innerHTML = '<option value="">— selecciona un curso —</option>';
    cursosData.forEach(curso => {
      const opt = document.createElement('option');
      opt.value = curso.id;
      opt.textContent = curso.name;
      select.appendChild(opt);
    });
    select.disabled = false;

    log('logCursos', '✓ ' + cursosData.length + ' curso(s) encontrado(s). Selecciona uno.');

    // Al seleccionar un curso desbloquear paso 3
    select.addEventListener('change', () => {
      if (select.value) {
        desbloquear('step3');
        document.getElementById('folderId').disabled = false;
        document.getElementById('btnGenerate').disabled = false;
      }
    });

  } catch (e) {
    log('logCursos', '✗ Error de red: ' + e.toString(), 'err');
  }
}

// ── PASO 3: Generar script ────────────────────────────────
function generarScript() {
  clearLog('log');
  document.getElementById('downloadSection').classList.remove('visible');

  const folderId = document.getElementById('folderId').value.trim();
  const select   = document.getElementById('selectCurso');
  const courseId = select.value;
  const courseName = select.options[select.selectedIndex]?.text || '';

  if (!folderId) {
    log('log', '✗ ERROR: Introduce el ID de la carpeta de Drive.', 'err');
    return;
  }
  if (!courseId) {
    log('log', '✗ ERROR: Selecciona un curso de Classroom.', 'err');
    return;
  }

  const btn = document.getElementById('btnGenerate');
  btn.disabled = true;

  log('log', '> Generando script...', 'info');
  setTimeout(() => log('log', '> Curso seleccionado : "' + courseName + '"'), 300);
  setTimeout(() => log('log', '> ID_CURSO           : ' + courseId), 500);
  setTimeout(() => log('log', '> ID_CARPETA_CLASE   : ' + folderId), 700);
  setTimeout(() => log('log', '> Inyectando valores en el template...', 'info'), 900);
  setTimeout(() => {
    scriptContent = buildScript(folderId, courseId, courseName);
    log('log', '> Script generado. (' + scriptContent.length + ' bytes)');
    log('log', '> Listo para descargar.');
    document.getElementById('downloadSection').classList.add('visible');
    btn.disabled = false;
  }, 1400);
}

// ── Descargar .gs ─────────────────────────────────────────
function descargarScript() {
  const blob = new Blob([scriptContent], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'classroom_organizer.gs';
  a.click();
  URL.revokeObjectURL(url);
  log('log', '> Descarga iniciada: classroom_organizer.gs', 'info');
}

// ── Template del script .gs ───────────────────────────────
function buildScript(folderId, courseId, courseName) {
  return `// ============================================================
// CLASSROOM ORGANIZER — Script generado automáticamente
// Creado por : Raúl Poblete Illescas
// Curso      : ${courseName}
// ID_CARPETA_CLASE : ${folderId}
// ID_CURSO         : ${courseId}
// ============================================================

const CONFIG = {
  ID_CARPETA_CLASE: "${folderId}",
  ID_CURSO: "${courseId}",
  NOMBRE_REFERENCIAS: "Referencias para hacer la actividad",
  NOMBRE_SIN_CLASIFICAR: "Sin clasificar"
};

// ─── FUNCIÓN PRINCIPAL ───────────────────────────────────────────────────────
function organizarClassroom() {
  const carpetaPrincipal = DriveApp.getFolderById(CONFIG.ID_CARPETA_CLASE);
  const actividades = Classroom.Courses.CourseWork.list(CONFIG.ID_CURSO).courseWork;

  if (!actividades || actividades.length === 0) {
    console.log("No se encontraron actividades.");
    return;
  }

  // Recopilar IDs de archivos entregados formalmente en Classroom
  const mapaEntregas = {};
  actividades.forEach(actividad => {
    try {
      const entregas = Classroom.Courses.CourseWork.StudentSubmissions.list(
        CONFIG.ID_CURSO, actividad.id, { userId: "me" }
      ).studentSubmissions;
      if (entregas) {
        entregas.forEach(entrega => {
          if (entrega.assignmentSubmission?.attachments) {
            entrega.assignmentSubmission.attachments.forEach(adjunto => {
              if (adjunto.driveFile) {
                mapaEntregas[adjunto.driveFile.id] = actividad.id;
              }
            });
          }
        });
      }
    } catch(e) {}
  });

  // Procesar cada actividad
  actividades.forEach(actividad => {
    const nombreCarpeta = formatearFecha(actividad.creationTime) + " - " + actividad.title;
    console.log("── " + nombreCarpeta);

    const carpetaActividad = obtenerOCrearCarpeta(carpetaPrincipal, nombreCarpeta);
    const carpetaReferencias = obtenerOCrearCarpeta(carpetaActividad, CONFIG.NOMBRE_REFERENCIAS);

    // 1. Materiales del profesor → accesos directos en Referencias
    if (actividad.materials) {
      actividad.materials.forEach(material => {
        if (material.driveFile) {
          const fileId = material.driveFile.driveFile.id;
          const fileName = material.driveFile.driveFile.title;
          if (!existeArchivoPorNombre(carpetaReferencias, fileName)) {
            try {
              carpetaReferencias.createShortcut(fileId);
              console.log("  📎 Referencia creada: " + fileName);
            } catch(e) {
              console.log("  ⚠️ Sin acceso al material: " + fileName);
            }
          } else {
            console.log("  ✓ Referencia ya existe: " + fileName);
          }
        }
      });
    }

    // 2. Mis archivos entregados formalmente → carpeta de actividad
    Object.keys(mapaEntregas).forEach(fileId => {
      if (mapaEntregas[fileId] === actividad.id) {
        try {
          const archivo = DriveApp.getFileById(fileId);
          const nombre = archivo.getName();
          const padreActualId = obtenerPadreId(archivo);
          if (padreActualId === carpetaActividad.getId()) {
            console.log("  ✓ Ya organizado: " + nombre);
          } else {
            archivo.moveTo(carpetaActividad);
            console.log("  ✅ Entrega movida a actividad: " + nombre);
          }
        } catch(e) {
          console.log("  ⚠️ Sin acceso al archivo: " + fileId);
        }
      }
    });

    // 3. Archivos en raíz no entregados formalmente → buscar coincidencia por nombre
    const archivosRaiz = carpetaPrincipal.getFiles();
    while (archivosRaiz.hasNext()) {
      const archivo = archivosRaiz.next();
      const fileId = archivo.getId();
      const nombre = archivo.getName().toLowerCase();
      const tituloActividad = actividad.title.toLowerCase();
      if (mapaEntregas[fileId]) continue;
      if (nombre.includes(tituloActividad) || tituloActividad.includes(nombre)) {
        archivo.moveTo(carpetaActividad);
        console.log("  ✅ Archivo por nombre movido a actividad: " + archivo.getName());
      }
    }
  });

  // 4. Archivos restantes en raíz → Sin clasificar
  const carpetaSinClasificar = obtenerOCrearCarpeta(carpetaPrincipal, CONFIG.NOMBRE_SIN_CLASIFICAR);
  const archivosRestantes = carpetaPrincipal.getFiles();
  while (archivosRestantes.hasNext()) {
    const archivo = archivosRestantes.next();
    if (archivo.getMimeType() === "application/vnd.google-apps.shortcut") continue;
    archivo.moveTo(carpetaSinClasificar);
    console.log("  📁 Sin clasificar: " + archivo.getName());
  }

  // 5. Limpiar accesos directos mal colocados
  limpiarAccesosDirectos(carpetaPrincipal);

  console.log("✅ ¡Terminado! Refresca tu Google Drive.");
}

// ─── LIMPIEZA DE ACCESOS DIRECTOS MAL COLOCADOS ──────────────────────────────
function limpiarAccesosDirectos(carpetaPrincipal) {
  const actividades = Classroom.Courses.CourseWork.list(CONFIG.ID_CURSO).courseWork;
  actividades.forEach(actividad => {
    const nombreCarpeta = formatearFecha(actividad.creationTime) + " - " + actividad.title;
    const ex = carpetaPrincipal.getFoldersByName(nombreCarpeta);
    if (!ex.hasNext()) return;
    const carpetaActividad = ex.next();
    const subRefs = carpetaActividad.getFoldersByName(CONFIG.NOMBRE_REFERENCIAS);
    if (!subRefs.hasNext()) return;
    const carpetaReferencias = subRefs.next();

    const idsMaterialesProfesor = new Set();
    if (actividad.materials) {
      actividad.materials.forEach(m => {
        if (m.driveFile) idsMaterialesProfesor.add(m.driveFile.driveFile.id);
      });
    }

    // En Referencias: eliminar accesos directos que NO son del profesor
    const archivosRefs = carpetaReferencias.getFiles();
    while (archivosRefs.hasNext()) {
      const archivo = archivosRefs.next();
      if (archivo.getMimeType() !== "application/vnd.google-apps.shortcut") continue;
      try {
        if (!idsMaterialesProfesor.has(archivo.getTargetId())) {
          archivo.setTrashed(true);
          console.log("  🗑️ Acceso directo incorrecto eliminado: " + archivo.getName());
        }
      } catch(e) {}
    }

    // En carpeta actividad: mover accesos directos del profesor a Referencias
    const archivosActividad = carpetaActividad.getFiles();
    while (archivosActividad.hasNext()) {
      const archivo = archivosActividad.next();
      if (archivo.getMimeType() !== "application/vnd.google-apps.shortcut") continue;
      try {
        if (idsMaterialesProfesor.has(archivo.getTargetId())) {
          if (!existeArchivoPorNombre(carpetaReferencias, archivo.getName())) {
            archivo.moveTo(carpetaReferencias);
            console.log("  ✅ Acceso directo movido a Referencias: " + archivo.getName());
          } else {
            archivo.setTrashed(true);
            console.log("  🗑️ Duplicado eliminado: " + archivo.getName());
          }
        }
      } catch(e) {}
    }
  });
}

// ─── UTILIDADES ──────────────────────────────────────────────────────────────
function formatearFecha(isoString) {
  const d = new Date(isoString);
  return d.getFullYear() + "-"
    + String(d.getMonth() + 1).padStart(2, "0") + "-"
    + String(d.getDate()).padStart(2, "0");
}

function obtenerOCrearCarpeta(padre, nombre) {
  const existentes = padre.getFoldersByName(nombre);
  return existentes.hasNext() ? existentes.next() : padre.createFolder(nombre);
}

function existeArchivoPorNombre(carpeta, nombre) {
  const archivos = carpeta.getFiles();
  while (archivos.hasNext()) {
    if (archivos.next().getName() === nombre) return true;
  }
  return false;
}

function obtenerPadreId(archivo) {
  const padres = archivo.getParents();
  return padres.hasNext() ? padres.next().getId() : null;
}

`;
}
