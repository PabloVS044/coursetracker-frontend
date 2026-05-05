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
      duration_hours: 18,
      lessons: 42,
      language: 'English',
      description:
        'Disena interfaces modulares y aprende a estructurar componentes con foco en mantenibilidad.',
      image_url: '',
      created_at: '2026-05-05T10:00:00.000Z',
      updated_at: '2026-05-05T10:00:00.000Z',
    },
    {
      id: 2,
      title: 'Go APIs from Scratch',
      instructor: 'Mario Sierra',
      platform: 'Platzi',
      category: 'Backend',
      level: 'advanced',
      price: 31.5,
      duration_hours: 14,
      lessons: 30,
      language: 'Spanish',
      description:
        'Construye servicios REST claros, pequenos y rapidos con Go, rutas y persistencia.',
      image_url: '',
      created_at: '2026-05-05T10:05:00.000Z',
      updated_at: '2026-05-05T10:05:00.000Z',
    },
    {
      id: 3,
      title: 'SQL para Analisis',
      instructor: 'Laura Benitez',
      platform: 'Coursera',
      category: 'Data',
      level: 'beginner',
      price: 19,
      duration_hours: 10,
      lessons: 26,
      language: 'Spanish',
      description:
        'Practica consultas reales, agregaciones y reportes para analisis de datos y dashboards.',
      image_url: '',
      created_at: '2026-05-05T10:10:00.000Z',
      updated_at: '2026-05-05T10:10:00.000Z',
    },
    {
      id: 4,
      title: 'Brand and UI Foundations',
      instructor: 'Sofia Ruiz',
      platform: 'Domestika',
      category: 'Design',
      level: 'intermediate',
      price: 22,
      duration_hours: 11,
      lessons: 21,
      language: 'English',
      description:
        'Aprende a crear sistemas visuales coherentes para productos digitales y paginas de marketing.',
      image_url: '',
      created_at: '2026-05-05T10:15:00.000Z',
      updated_at: '2026-05-05T10:15:00.000Z',
    },
    {
      id: 5,
      title: 'Notion for Deep Work',
      instructor: 'Adrian Rojas',
      platform: 'Skillshare',
      category: 'Productividad',
      level: 'beginner',
      price: 12,
      duration_hours: 7,
      lessons: 16,
      language: 'Spanish',
      description:
        'Organiza objetivos, tareas y notas en un flujo simple pensado para estudiantes y creadores.',
      image_url: '',
      created_at: '2026-05-05T10:20:00.000Z',
      updated_at: '2026-05-05T10:20:00.000Z',
    },
    {
      id: 6,
      title: 'Node Architecture Patterns',
      instructor: 'Daniel Castro',
      platform: 'Frontend Masters',
      category: 'Backend',
      level: 'advanced',
      price: 35,
      duration_hours: 15,
      lessons: 34,
      language: 'English',
      description:
        'Refuerza capas, validaciones, errores y modularidad para proyectos Node bien mantenidos.',
      image_url: '',
      created_at: '2026-05-05T10:25:00.000Z',
      updated_at: '2026-05-05T10:25:00.000Z',
    },
  ];

  function cloneBaseCourses() {
    return JSON.parse(JSON.stringify(baseCourses));
  }

  function normalizeCourse(course, index = 0) {
    const now = new Date().toISOString();
    const durationHours = Number(course.duration_hours ?? course.durationHours ?? 0);
    const lessons = Number(course.lessons ?? 1);

    return {
      id: Number(course.id ?? Date.now() + index),
      title: String(course.title ?? '').trim(),
      instructor: String(course.instructor ?? '').trim(),
      platform: String(course.platform ?? '').trim(),
      category: String(course.category ?? '').trim() || 'Frontend',
      level: String(course.level ?? 'beginner').trim(),
      price: Number(course.price ?? 0),
      duration_hours: Number.isInteger(durationHours) && durationHours > 0 ? durationHours : null,
      lessons: Number.isInteger(lessons) && lessons > 0 ? lessons : 1,
      language: String(course.language ?? 'English').trim() || 'English',
      description: String(course.description ?? '').trim(),
      image_url: String(course.image_url ?? course.imageUrl ?? '').trim(),
      created_at: String(course.created_at ?? now),
      updated_at: String(course.updated_at ?? course.createdAt ?? course.created_at ?? now),
    };
  }

  function loadCourses() {
    const rawCourses = window.localStorage.getItem(STORAGE_KEY);

    if (!rawCourses) {
      return cloneBaseCourses();
    }

    try {
      const parsedCourses = JSON.parse(rawCourses);
      return Array.isArray(parsedCourses)
        ? parsedCourses.map((course, index) => normalizeCourse(course, index))
        : cloneBaseCourses();
    } catch (error) {
      return cloneBaseCourses();
    }
  }

  function saveCourses(courses) {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(courses.map((course, index) => normalizeCourse(course, index)))
    );
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
    const timestamp = new Date().toISOString();
    const newCourse = {
      id: Date.now(),
      created_at: timestamp,
      updated_at: timestamp,
      ...payload,
    };

    courses.unshift(normalizeCourse(newCourse));
    saveCourses(courses);
    return courses[0];
  }

  function updateCourse(courseId, payload) {
    const numericId = Number(courseId);
    const timestamp = new Date().toISOString();
    const courses = loadCourses().map((course) =>
      course.id === numericId
        ? normalizeCourse({
            ...course,
            ...payload,
            id: numericId,
            created_at: course.created_at,
            updated_at: timestamp,
          })
        : course
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
      duration_hours:
        formData.get('duration_hours') === '' ? null : Number(formData.get('duration_hours')),
      lessons: Number(formData.get('lessons')),
      language: String(formData.get('language')).trim(),
      description: String(formData.get('description')).trim(),
      image_url: String(formData.get('image_url')).trim(),
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
