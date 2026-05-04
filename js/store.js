(function () {
  const STORAGE_KEY = 'coursetracker-demo-courses';

  const baseCourses = [
    {
      id: 1,
      title: 'React Interface Systems',
      instructor: 'Camila Mendoza',
      platform: 'Udemy',
      category: 'Frontend',
      level: 'intermediate',
      price: 24.99,
      durationHours: 18,
      lessons: 42,
      description:
        'Disena interfaces modulares y aprende a estructurar componentes con foco en mantenibilidad.',
    },
    {
      id: 2,
      title: 'Go APIs from Scratch',
      instructor: 'Mario Sierra',
      platform: 'Platzi',
      category: 'Backend',
      level: 'advanced',
      price: 31.5,
      durationHours: 14,
      lessons: 30,
      description:
        'Construye servicios REST claros, pequenos y rapidos con Go, rutas y persistencia.',
    },
    {
      id: 3,
      title: 'SQL para Analisis',
      instructor: 'Laura Benitez',
      platform: 'Coursera',
      category: 'Data',
      level: 'beginner',
      price: 19,
      durationHours: 10,
      lessons: 26,
      description:
        'Practica consultas reales, agregaciones y reportes para analisis de datos y dashboards.',
    },
    {
      id: 4,
      title: 'Brand and UI Foundations',
      instructor: 'Sofia Ruiz',
      platform: 'Domestika',
      category: 'Design',
      level: 'intermediate',
      price: 22,
      durationHours: 11,
      lessons: 21,
      description:
        'Aprende a crear sistemas visuales coherentes para productos digitales y paginas de marketing.',
    },
    {
      id: 5,
      title: 'Notion for Deep Work',
      instructor: 'Adrian Rojas',
      platform: 'Skillshare',
      category: 'Productividad',
      level: 'beginner',
      price: 12,
      durationHours: 7,
      lessons: 16,
      description:
        'Organiza objetivos, tareas y notas en un flujo simple pensado para estudiantes y creadores.',
    },
    {
      id: 6,
      title: 'Node Architecture Patterns',
      instructor: 'Daniel Castro',
      platform: 'Frontend Masters',
      category: 'Backend',
      level: 'advanced',
      price: 35,
      durationHours: 15,
      lessons: 34,
      description:
        'Refuerza capas, validaciones, errores y modularidad para proyectos Node bien mantenidos.',
    },
  ];

  function cloneBaseCourses() {
    return JSON.parse(JSON.stringify(baseCourses));
  }

  function loadCourses() {
    const rawCourses = window.localStorage.getItem(STORAGE_KEY);

    if (!rawCourses) {
      return cloneBaseCourses();
    }

    try {
      const parsedCourses = JSON.parse(rawCourses);
      return Array.isArray(parsedCourses) ? parsedCourses : cloneBaseCourses();
    } catch (error) {
      return cloneBaseCourses();
    }
  }

  function saveCourses(courses) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
  }

  function resetCourses() {
    const courses = cloneBaseCourses();
    saveCourses(courses);
    return courses;
  }

  function getCourseById(courseId) {
    return loadCourses().find((course) => course.id === Number(courseId)) || null;
  }

  function createCourse(payload) {
    const courses = loadCourses();
    const newCourse = {
      id: Date.now(),
      ...payload,
    };

    courses.unshift(newCourse);
    saveCourses(courses);
    return newCourse;
  }

  function updateCourse(courseId, payload) {
    const numericId = Number(courseId);
    const courses = loadCourses().map((course) =>
      course.id === numericId ? { ...course, ...payload, id: numericId } : course
    );

    saveCourses(courses);
    return courses.find((course) => course.id === numericId) || null;
  }

  function deleteCourse(courseId) {
    const numericId = Number(courseId);
    const courses = loadCourses().filter((course) => course.id !== numericId);
    saveCourses(courses);
  }

  function getCategories(courses) {
    return ['Todas', ...new Set(courses.map((course) => course.category))];
  }

  function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(price));
  }

  function formatLevel(level) {
    return {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
    }[level] || level;
  }

  function buildCourseFormPayload(formData) {
    return {
      title: String(formData.get('title')).trim(),
      instructor: String(formData.get('instructor')).trim(),
      platform: String(formData.get('platform')).trim(),
      category: String(formData.get('category')).trim(),
      level: String(formData.get('level')).trim(),
      price: Number(formData.get('price')),
      durationHours: Number(formData.get('durationHours')),
      lessons: Number(formData.get('lessons')),
      description: String(formData.get('description')).trim(),
    };
  }

  window.CourseTrackerStore = {
    buildCourseFormPayload,
    createCourse,
    deleteCourse,
    formatLevel,
    formatPrice,
    getCategories,
    getCourseById,
    loadCourses,
    resetCourses,
    saveCourses,
    updateCourse,
  };
})();
