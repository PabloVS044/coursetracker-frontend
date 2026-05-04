(function () {
  const store = window.CourseTrackerStore;

  const elements = {
    summaryGrid: document.querySelector('#summary-grid'),
    resultsSummary: document.querySelector('#results-summary'),
    searchInput: document.querySelector('#search-input'),
    categorySelect: document.querySelector('#category-select'),
    courseList: document.querySelector('#course-list'),
    emptyState: document.querySelector('#empty-state'),
    restoreDemoButton: document.querySelector('#restore-demo-button'),
  };

  const state = {
    courses: store.loadCourses(),
    searchTerm: '',
    category: 'Todas',
  };

  bindEvents();
  render();

  function bindEvents() {
    elements.searchInput.addEventListener('input', (event) => {
      state.searchTerm = event.target.value.trim().toLowerCase();
      renderCourses();
    });

    elements.categorySelect.addEventListener('change', (event) => {
      state.category = event.target.value;
      renderCourses();
    });

    elements.restoreDemoButton.addEventListener('click', () => {
      state.courses = store.resetCourses();
      state.searchTerm = '';
      state.category = 'Todas';
      elements.searchInput.value = '';
      render();
    });
  }

  function render() {
    renderSummary();
    renderCategoryOptions();
    renderCourses();
  }

  function renderSummary() {
    const totalHours = state.courses.reduce((sum, course) => sum + course.durationHours, 0);
    const totalPlatforms = new Set(state.courses.map((course) => course.platform)).size;

    elements.summaryGrid.innerHTML = `
      <article class="summary-card">
        <span>Total de cursos</span>
        <strong>${state.courses.length}</strong>
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

  function renderCategoryOptions() {
    const categories = store.getCategories(state.courses);

    elements.categorySelect.innerHTML = categories
      .map(
        (category) => `
          <option value="${category}" ${category === state.category ? 'selected' : ''}>
            ${category}
          </option>
        `
      )
      .join('');
  }

  function renderCourses() {
    const visibleCourses = state.courses.filter((course) => {
      const haystack = `${course.title} ${course.instructor} ${course.platform}`.toLowerCase();
      const matchesSearch = haystack.includes(state.searchTerm);
      const matchesCategory = state.category === 'Todas' || course.category === state.category;
      return matchesSearch && matchesCategory;
    });

    elements.resultsSummary.textContent = `${visibleCourses.length} cursos visibles`;
    elements.emptyState.hidden = visibleCourses.length > 0;

    if (visibleCourses.length === 0) {
      elements.courseList.innerHTML = '';
      return;
    }

    elements.courseList.innerHTML = visibleCourses
      .map(
        (course) => `
          <article class="course-card">
            <span class="course-badge">${course.category}</span>
            <h3>${course.title}</h3>
            <div class="course-meta">
              <span>${course.instructor}</span>
              <span>${course.platform}</span>
              <span>${store.formatLevel(course.level)} · ${course.durationHours}h</span>
            </div>
            <p>${course.description}</p>
            <div class="course-price">${store.formatPrice(course.price)}</div>
            <div class="card-actions">
              <a class="button button-primary" href="./course.html?id=${course.id}">Ver detalle</a>
              <a class="button button-secondary" href="./form.html?id=${course.id}">Editar</a>
              <button class="button button-secondary" type="button" data-delete-id="${course.id}">
                Eliminar
              </button>
            </div>
          </article>
        `
      )
      .join('');

    elements.courseList.querySelectorAll('[data-delete-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const confirmed = window.confirm('Deseas eliminar este curso de la demo local?');

        if (!confirmed) {
          return;
        }

        store.deleteCourse(button.dataset.deleteId);
        state.courses = store.loadCourses();
        render();
      });
    });
  }
})();
