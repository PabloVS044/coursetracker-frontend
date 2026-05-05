var courseStore = window.CourseStore;
var detailElements = {};
var detailCourseId = null;
var detailCourse = null;

document.addEventListener('DOMContentLoaded', initDetailPage);

async function initDetailPage() {
  cacheDetailElements();
  detailCourseId = new URLSearchParams(window.location.search).get('id');

  if (!detailCourseId) {
    renderMissingCourse('No se recibio un identificador de curso.');
    return;
  }

  renderLoadingCourse();

  try {
    detailCourse = await courseStore.getCourseById(detailCourseId);
  } catch (error) {
    if (error.status === 404) {
      renderMissingCourse('El curso solicitado no existe en la base de datos.');
      return;
    }

    renderDetailError(error.message || 'No se pudo cargar el curso.');
    return;
  }

  if (!detailCourse) {
    renderMissingCourse('El curso solicitado no existe en la base de datos.');
    return;
  }

  renderDetailCourse();
  bindDetailEvents();
}

function cacheDetailElements() {
  detailElements.panel = document.querySelector('#detail-panel');
}

function renderLoadingCourse() {
  detailElements.panel.innerHTML = `
    <div class="notice-box">
      <h2>Cargando curso</h2>
      <p>Esperando respuesta del backend.</p>
    </div>
  `;
}

function renderMissingCourse(message) {
  detailElements.panel.innerHTML = `
    <div class="notice-box">
      <h2>Curso no encontrado</h2>
      <p>${message}</p>
      <a class="button button-primary" href="./courses.html">Volver al catalogo</a>
    </div>
  `;
}

function renderDetailError(message) {
  detailElements.panel.innerHTML = `
    <div class="notice-box">
      <h2>No se pudo cargar el curso</h2>
      <p>${message}</p>
      <p>Verifica que el backend este corriendo en ${courseStore.apiBaseUrl}.</p>
      <a class="button button-primary" href="./courses.html">Volver al catalogo</a>
    </div>
  `;
}

function renderDetailCourse() {
  detailElements.panel.innerHTML = `
    <div class="detail-header">
      <span class="detail-badge">${detailCourse.category}</span>
      <h2>${detailCourse.title}</h2>
      <div class="detail-meta">
        <span>${detailCourse.instructor}</span>
        <span>${detailCourse.platform}</span>
        <span>${courseStore.formatLevel(detailCourse.level)}</span>
        <span>${detailCourse.language}</span>
      </div>
      <p>${detailCourse.description || 'Sin descripcion disponible.'}</p>
    </div>

    <dl class="detail-grid">
      <div>
        <dt>Precio</dt>
        <dd>${courseStore.formatPrice(detailCourse.price)}</dd>
      </div>
      <div>
        <dt>Duracion</dt>
        <dd>${detailCourse.duration_hours || '-'} horas</dd>
      </div>
      <div>
        <dt>Lecciones</dt>
        <dd>${detailCourse.lessons}</dd>
      </div>
      <div>
        <dt>Idioma</dt>
        <dd>${detailCourse.language}</dd>
      </div>
      <div>
        <dt>Categoria</dt>
        <dd>${detailCourse.category}</dd>
      </div>
    </dl>

    ${renderDetailImageBlock()}

    <div class="detail-actions">
      <a class="button button-primary" href="./form.html?id=${detailCourse.id}">Editar curso</a>
      <button class="button button-secondary" id="delete-course-button" type="button">
        Eliminar
      </button>
      <a class="button button-secondary" href="./courses.html">Volver</a>
    </div>
  `;
}

function renderDetailImageBlock() {
  if (!detailCourse.image_url) {
    return '';
  }

  return `
    <div class="notice-box">
      <h3>Imagen del curso</h3>
      <p>
        <a class="text-link" href="${detailCourse.image_url}" target="_blank" rel="noreferrer">
          Abrir imagen configurada
        </a>
      </p>
    </div>
  `;
}

function bindDetailEvents() {
  var deleteButton = document.querySelector('#delete-course-button');
  deleteButton.addEventListener('click', handleDetailDeleteClick);
}

async function handleDetailDeleteClick() {
  var confirmed = window.confirm('Deseas eliminar este curso?');

  if (!confirmed) {
    return;
  }

  try {
    await courseStore.deleteCourse(detailCourse.id);
    window.location.href = './courses.html';
  } catch (error) {
    window.alert(error.message || 'No se pudo eliminar el curso');
  }
}
