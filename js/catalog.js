var courseStore = window.CourseStore;
var catalogElements = {};
var catalogState = {
  courses: [],
  searchTerm: '',
  category: 'Todas',
  loading: false,
  errorMessage: '',
};

document.addEventListener('DOMContentLoaded', initCatalogPage);

async function initCatalogPage() {
  cacheCatalogElements();
  bindCatalogEvents();
  await loadCatalogCourses();
}

function cacheCatalogElements() {
  catalogElements.summaryGrid = document.querySelector('#summary-grid');
  catalogElements.resultsSummary = document.querySelector('#results-summary');
  catalogElements.searchInput = document.querySelector('#search-input');
  catalogElements.categorySelect = document.querySelector('#category-select');
  catalogElements.courseList = document.querySelector('#course-list');
  catalogElements.emptyState = document.querySelector('#empty-state');
  catalogElements.reloadCoursesButton = document.querySelector('#reload-courses-button');
}

function bindCatalogEvents() {
  catalogElements.searchInput.addEventListener('input', handleCatalogSearchInput);
  catalogElements.categorySelect.addEventListener('change', handleCatalogCategoryChange);
  catalogElements.reloadCoursesButton.addEventListener('click', handleReloadCoursesClick);
}

async function loadCatalogCourses() {
  catalogState.loading = true;
  catalogState.errorMessage = '';
  renderCatalogPage();

  try {
    catalogState.courses = await courseStore.loadCourses();
  } catch (error) {
    catalogState.courses = [];
    catalogState.errorMessage = error.message || 'No se pudieron cargar los cursos';
  }

  catalogState.loading = false;
  renderCatalogPage();
}

function handleCatalogSearchInput(event) {
  catalogState.searchTerm = event.target.value.trim().toLowerCase();
  renderCatalogCourses();
}

function handleCatalogCategoryChange(event) {
  catalogState.category = event.target.value;
  renderCatalogCourses();
}

async function handleReloadCoursesClick() {
  await loadCatalogCourses();
}

function renderCatalogPage() {
  renderCatalogSummary();
  renderCatalogCategoryOptions();
  renderCatalogCourses();
}

function renderCatalogSummary() {
  var totalHours = catalogState.courses.reduce(function sumHours(sum, course) {
    return sum + Number(course.duration_hours || 0);
  }, 0);
  var totalPlatforms = new Set(
    catalogState.courses.map(function mapPlatform(course) {
      return course.platform;
    })
  ).size;

  catalogElements.summaryGrid.innerHTML = `
    <article class="summary-card">
      <span>Total de cursos</span>
      <strong>${catalogState.courses.length}</strong>
    </article>
    <article class="summary-card">
      <span>Horas acumuladas</span>
      <strong>${totalHours}</strong>
    </article>
    <article class="summary-card">
      <span>Plataformas</span>
      <strong>${totalPlatforms}</strong>
    </article>
  `;
}

function renderCatalogCategoryOptions() {
  var categories = courseStore.getCategories(catalogState.courses);

  if (!categories.includes(catalogState.category)) {
    catalogState.category = 'Todas';
  }

  catalogElements.categorySelect.innerHTML = categories
    .map(function mapCategory(category) {
      return `
        <option value="${category}" ${category === catalogState.category ? 'selected' : ''}>
          ${category}
        </option>
      `;
    })
    .join('');
}

function renderCatalogCourses() {
  var visibleCourses = getVisibleCatalogCourses();

  if (catalogState.loading) {
    catalogElements.resultsSummary.textContent = 'Cargando cursos...';
    catalogElements.courseList.innerHTML = '';
    catalogElements.emptyState.hidden = false;
    catalogElements.emptyState.innerHTML = `
      <h3>Cargando</h3>
      <p>Esperando respuesta del backend.</p>
    `;
    return;
  }

  if (catalogState.errorMessage) {
    catalogElements.resultsSummary.textContent = 'No se pudo cargar el catalogo';
    catalogElements.courseList.innerHTML = '';
    catalogElements.emptyState.hidden = false;
    catalogElements.emptyState.innerHTML = `
      <h3>Error al cargar cursos</h3>
      <p>${catalogState.errorMessage}</p>
      <p>Verifica que el backend este corriendo en ${courseStore.apiBaseUrl}.</p>
    `;
    return;
  }

  catalogElements.resultsSummary.textContent = `${visibleCourses.length} cursos visibles`;
  catalogElements.emptyState.hidden = visibleCourses.length > 0;

  if (visibleCourses.length === 0) {
    catalogElements.courseList.innerHTML = '';
    catalogElements.emptyState.innerHTML = `
      <h3>No hay coincidencias</h3>
      <p>Cambia el filtro o crea un curso nuevo.</p>
    `;
    return;
  }

  catalogElements.courseList.innerHTML = visibleCourses
    .map(function mapCourse(course) {
      return `
        <article class="course-card">
          <span class="course-badge">${course.category}</span>
          <h3>${course.title}</h3>
          <div class="course-meta">
            <span>${course.instructor}</span>
            <span>${course.platform}</span>
            <span>${courseStore.formatLevel(course.level)} · ${course.duration_hours || '-'}h</span>
            <span>${course.lessons} lecciones · ${course.language}</span>
          </div>
          <p>${course.description || 'Sin descripcion disponible.'}</p>
          <div class="course-price">${courseStore.formatPrice(course.price)}</div>
          <div class="card-actions">
            <a class="button button-primary" href="./course.html?id=${course.id}">Ver detalle</a>
            <a class="button button-secondary" href="./form.html?id=${course.id}">Editar</a>
            <button class="button button-secondary" type="button" data-delete-id="${course.id}">
              Eliminar
            </button>
          </div>
        </article>
      `;
    })
    .join('');

  bindCatalogDeleteButtons();
}

function getVisibleCatalogCourses() {
  return catalogState.courses.filter(function filterCourse(course) {
    var haystack = `${course.title} ${course.instructor} ${course.platform} ${course.language}`
      .toLowerCase();
    var matchesSearch = haystack.includes(catalogState.searchTerm);
    var matchesCategory =
      catalogState.category === 'Todas' || course.category === catalogState.category;

    return matchesSearch && matchesCategory;
  });
}

function bindCatalogDeleteButtons() {
  var buttons = catalogElements.courseList.querySelectorAll('[data-delete-id]');

  buttons.forEach(function forEachButton(button) {
    button.addEventListener('click', handleCatalogDeleteClick);
  });
}

async function handleCatalogDeleteClick(event) {
  var courseId = event.currentTarget.dataset.deleteId;
  var confirmed = window.confirm('Deseas eliminar este curso?');

  if (!confirmed) {
    return;
  }

  try {
    await courseStore.deleteCourse(courseId);
    await loadCatalogCourses();
  } catch (error) {
    window.alert(error.message || 'No se pudo eliminar el curso');
  }
}
