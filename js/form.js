var courseStore = window.CourseStore;
var formElements = {};
var formCourseId = null;
var formCourse = null;

document.addEventListener('DOMContentLoaded', initFormPage);

async function initFormPage() {
  cacheFormElements();
  formCourseId = new URLSearchParams(window.location.search).get('id');

  if (formCourseId) {
    await loadCourseForEdit(formCourseId);

    if (!formCourse) {
      return;
    }
  }

  bindFormEvents();
}

function cacheFormElements() {
  formElements.pageTitle = document.querySelector('#form-page-title');
  formElements.form = document.querySelector('#course-form');
  formElements.cancelLink = document.querySelector('#cancel-link');
  formElements.feedback = document.querySelector('#form-feedback');
  formElements.submitButton = formElements.form.querySelector('button[type="submit"]');
}

async function loadCourseForEdit(courseId) {
  setFormFeedback('Cargando curso para editar...', false);
  setFormBusyState(true, 'Cargando...');

  try {
    formCourse = await courseStore.getCourseById(courseId);
  } catch (error) {
    if (error.status === 404) {
      window.location.href = './courses.html';
      return;
    }

    setFormFeedback(
      (error.message || 'No se pudo cargar el curso.') +
        ' Verifica que el backend este corriendo en ' +
        courseStore.apiBaseUrl +
        '.',
      true
    );
    setFormBusyState(true, 'No disponible');
    return;
  }

  if (!formCourse) {
    window.location.href = './courses.html';
    return;
  }

  setFormBusyState(false, 'Guardar curso');
  prepareEditForm();
  clearFormFeedback();
}

function prepareEditForm() {
  formElements.pageTitle.textContent = 'Editar curso';
  formElements.cancelLink.href = './course.html?id=' + formCourse.id;
  fillCourseForm(formCourse);
}

function bindFormEvents() {
  formElements.form.addEventListener('submit', handleCourseFormSubmit);
}

async function handleCourseFormSubmit(event) {
  var payload;
  var savedCourse;

  event.preventDefault();
  clearFormFeedback();
  payload = courseStore.buildCourseFormPayload(new FormData(formElements.form));

  setFormBusyState(true, 'Guardando...');

  try {
    savedCourse = formCourse
      ? await courseStore.updateCourse(formCourse.id, payload)
      : await courseStore.createCourse(payload);
  } catch (error) {
    setFormFeedback(buildFormErrorMessage(error), true);
    setFormBusyState(false, 'Guardar curso');
    return;
  }

  window.location.href = './course.html?id=' + savedCourse.id;
}

function fillCourseForm(currentCourse) {
  formElements.form.elements.namedItem('title').value = currentCourse.title;
  formElements.form.elements.namedItem('instructor').value = currentCourse.instructor;
  formElements.form.elements.namedItem('platform').value = currentCourse.platform;
  formElements.form.elements.namedItem('category').value = currentCourse.category;
  formElements.form.elements.namedItem('level').value = currentCourse.level;
  formElements.form.elements.namedItem('price').value = currentCourse.price;
  formElements.form.elements.namedItem('duration_hours').value = currentCourse.duration_hours ?? '';
  formElements.form.elements.namedItem('lessons').value = currentCourse.lessons;
  formElements.form.elements.namedItem('language').value = currentCourse.language;
  formElements.form.elements.namedItem('image_url').value = currentCourse.image_url ?? '';
  formElements.form.elements.namedItem('description').value = currentCourse.description;
}

function buildFormErrorMessage(error) {
  var baseMessage = error.message || 'No se pudo guardar el curso.';

  if (!Array.isArray(error.details) || error.details.length === 0) {
    return baseMessage;
  }

  return (
    baseMessage +
    ' ' +
    error.details
      .map(function mapDetail(detail) {
        return detail.field + ': ' + detail.message;
      })
      .join(' | ')
  );
}

function setFormBusyState(isBusy, buttonLabel) {
  var elements = formElements.form.querySelectorAll('input, select, textarea, button');

  elements.forEach(function forEachElement(element) {
    element.disabled = isBusy;
  });

  formElements.submitButton.textContent = buttonLabel;
}

function setFormFeedback(message, isError) {
  formElements.feedback.hidden = false;
  formElements.feedback.textContent = message;
  formElements.feedback.dataset.state = isError ? 'error' : 'info';
}

function clearFormFeedback() {
  formElements.feedback.hidden = true;
  formElements.feedback.textContent = '';
  formElements.feedback.dataset.state = '';
}
