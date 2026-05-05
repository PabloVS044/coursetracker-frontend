(function () {
  const store = window.CourseTrackerStore;
  const detailPanel = document.querySelector('#detail-panel');
  const params = new URLSearchParams(window.location.search);
  const courseId = params.get('id');
  const course = store.getCourseById(courseId);

  if (!courseId || !course) {
    detailPanel.innerHTML = `
      <div class="notice-box">
        <h2>Curso no encontrado</h2>
        <p>El curso solicitado no existe en esta demo local.</p>
        <a class="button button-primary" href="./courses.html">Volver al catalogo</a>
      </div>
    `;
    return;
  }

  detailPanel.innerHTML = `
    <div class="detail-header">
      <span class="detail-badge">${course.category}</span>
      <h2>${course.title}</h2>
      <div class="detail-meta">
        <span>${course.instructor}</span>
        <span>${course.platform}</span>
        <span>${store.formatLevel(course.level)}</span>
        <span>${course.language}</span>
      </div>
      <p>${course.description}</p>
    </div>

    <dl class="detail-grid">
      <div>
        <dt>Precio</dt>
        <dd>${store.formatPrice(course.price)}</dd>
      </div>
      <div>
        <dt>Duracion</dt>
        <dd>${course.duration_hours || '-'} horas</dd>
      </div>
      <div>
        <dt>Lecciones</dt>
        <dd>${course.lessons}</dd>
      </div>
      <div>
        <dt>Idioma</dt>
        <dd>${course.language}</dd>
      </div>
      <div>
        <dt>Categoria</dt>
        <dd>${course.category}</dd>
      </div>
    </dl>

    ${
      course.image_url
        ? `
          <div class="notice-box">
            <h3>Imagen del curso</h3>
            <p><a class="text-link" href="${course.image_url}" target="_blank" rel="noreferrer">Abrir imagen configurada</a></p>
          </div>
        `
        : ''
    }

    <div class="detail-actions">
      <a class="button button-primary" href="./form.html?id=${course.id}">Editar curso</a>
      <button class="button button-secondary" id="delete-course-button" type="button">
        Eliminar
      </button>
      <a class="button button-secondary" href="./courses.html">Volver</a>
    </div>
  `;

  document.querySelector('#delete-course-button').addEventListener('click', () => {
    const confirmed = window.confirm('Deseas eliminar este curso de la demo local?');

    if (!confirmed) {
      return;
    }

    store.deleteCourse(course.id);
    window.location.href = './courses.html';
  });
})();
