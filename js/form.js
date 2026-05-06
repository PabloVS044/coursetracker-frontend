var courseStore = window.CourseStore;
var formElements = {};
var formCourseId = null;
var formCourse = null;
var imagePreviewObjectUrl = null;

document.addEventListener('DOMContentLoaded', initFormPage);
window.addEventListener('beforeunload', clearImagePreviewObjectUrl);

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
  renderImagePreview();
}

function cacheFormElements() {
  formElements.pageTitle = document.querySelector('#form-page-title');
  formElements.form = document.querySelector('#course-form');
  formElements.cancelLink = document.querySelector('#cancel-link');
  formElements.feedback = document.querySelector('#form-feedback');
  formElements.submitButton = formElements.form.querySelector('button[type="submit"]');
  formElements.imageUrlInput = formElements.form.elements.namedItem('image_url');
  formElements.imageFileInput = formElements.form.elements.namedItem('image_file');
  formElements.imagePreviewFrame = document.querySelector('#image-preview-frame');
  formElements.imagePreviewNote = document.querySelector('#image-preview-note');
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
  formElements.imageUrlInput.addEventListener('input', handleImageSourceChange);
  formElements.imageFileInput.addEventListener('change', handleImageSourceChange);
}

async function handleCourseFormSubmit(event) {
  var formData;
  var payload;
  var selectedImageFile;
  var uploadedImage;
  var savedCourse;

  event.preventDefault();
  clearFormFeedback();
  formData = new FormData(formElements.form);
  payload = courseStore.buildCourseFormPayload(formData);
  selectedImageFile = getSelectedImageFile(formData);

  setFormBusyState(true, 'Guardando...');

  try {
    if (selectedImageFile) {
      setFormFeedback('Subiendo imagen a Cloudinary...', false);
      uploadedImage = await courseStore.uploadCourseImage(selectedImageFile);
      payload.image_url = uploadedImage && uploadedImage.url ? uploadedImage.url : payload.image_url;
      formElements.form.elements.namedItem('image_url').value = payload.image_url || '';
      formElements.form.elements.namedItem('image_file').value = '';
      renderImagePreview();
    }

    setFormFeedback('Guardando curso...', false);
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

function getSelectedImageFile(formData) {
  var selectedValue = formData.get('image_file');

  if (
    !selectedValue ||
    typeof selectedValue === 'string' ||
    typeof selectedValue.name !== 'string' ||
    selectedValue.size === 0
  ) {
    return null;
  }

  return selectedValue;
}

function handleImageSourceChange() {
  renderImagePreview();
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
  renderImagePreview();
}

function renderImagePreview() {
  var imageFile = getSelectedImageFile(new FormData(formElements.form));
  var imageUrl = String(formElements.imageUrlInput.value || '').trim();

  clearImagePreviewObjectUrl();

  if (imageFile) {
    imagePreviewObjectUrl = window.URL.createObjectURL(imageFile);
    setImagePreview(imagePreviewObjectUrl, 'Vista previa local. Se subira a Cloudinary al guardar.');
    return;
  }

  if (imageUrl) {
    setImagePreview(imageUrl, 'Vista previa usando la URL configurada.');
    return;
  }

  resetImagePreview();
}

function setImagePreview(src, note) {
  var image = document.createElement('img');
  image.alt = 'Vista previa de la portada del curso';
  image.src = src;
  image.addEventListener('error', handleImagePreviewError, { once: true });

  formElements.imagePreviewFrame.replaceChildren(image);
  formElements.imagePreviewNote.textContent = note;
}

function resetImagePreview() {
  var placeholder = document.createElement('div');
  placeholder.className = 'image-preview-placeholder';
  placeholder.textContent =
    'Selecciona un archivo o pega una URL para ver la portada antes de guardar.';

  formElements.imagePreviewFrame.replaceChildren(placeholder);
  formElements.imagePreviewNote.textContent = 'Sin imagen seleccionada.';
}

function clearImagePreviewObjectUrl() {
  if (!imagePreviewObjectUrl) {
    return;
  }

  window.URL.revokeObjectURL(imagePreviewObjectUrl);
  imagePreviewObjectUrl = null;
}

function handleImagePreviewError() {
  resetImagePreview();
  formElements.imagePreviewNote.textContent = 'No se pudo cargar la imagen de vista previa.';
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
