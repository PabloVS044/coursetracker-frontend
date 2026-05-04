(function () {
  const store = window.CourseTrackerStore;
  const params = new URLSearchParams(window.location.search);
  const courseId = params.get('id');
  const course = courseId ? store.getCourseById(courseId) : null;

  const formPageTitle = document.querySelector('#form-page-title');
  const courseForm = document.querySelector('#course-form');
  const cancelLink = document.querySelector('#cancel-link');

  if (courseId && !course) {
    window.location.href = './courses.html';
    return;
  }

  if (course) {
    formPageTitle.textContent = 'Editar curso';
    cancelLink.href = `./course.html?id=${course.id}`;
    fillForm(course);
  }

  courseForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const payload = store.buildCourseFormPayload(new FormData(courseForm));
    const savedCourse = course
      ? store.updateCourse(course.id, payload)
      : store.createCourse(payload);

    window.location.href = `./course.html?id=${savedCourse.id}`;
  });

  function fillForm(currentCourse) {
    courseForm.elements.namedItem('title').value = currentCourse.title;
    courseForm.elements.namedItem('instructor').value = currentCourse.instructor;
    courseForm.elements.namedItem('platform').value = currentCourse.platform;
    courseForm.elements.namedItem('category').value = currentCourse.category;
    courseForm.elements.namedItem('level').value = currentCourse.level;
    courseForm.elements.namedItem('price').value = currentCourse.price;
    courseForm.elements.namedItem('durationHours').value = currentCourse.durationHours;
    courseForm.elements.namedItem('lessons').value = currentCourse.lessons;
    courseForm.elements.namedItem('description').value = currentCourse.description;
  }
})();
