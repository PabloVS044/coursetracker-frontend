var courseTrackerConfig = window.CourseTrackerConfig || {};
var API_BASE_URL = String(courseTrackerConfig.apiBaseUrl || 'http://localhost:3000').replace(
  /\/+$/,
  ''
);

function createRequestError(message, status, details) {
  var error = new Error(message);
  error.status = status;
  error.details = Array.isArray(details) ? details : [];
  return error;
}

function normalizeCourse(course) {
  if (!course || typeof course !== 'object') {
    return null;
  }

  return {
    id: Number(course.id),
    title: String(course.title ?? '').trim(),
    instructor: String(course.instructor ?? '').trim(),
    platform: String(course.platform ?? '').trim(),
    category: String(course.category ?? '').trim() || 'Sin categoria',
    level: String(course.level ?? '').trim(),
    price: Number(course.price ?? 0),
    duration_hours:
      course.duration_hours === null || course.duration_hours === undefined
        ? null
        : Number(course.duration_hours),
    lessons: Number(course.lessons ?? 0),
    language: String(course.language ?? '').trim(),
    description: String(course.description ?? '').trim(),
    image_url: String(course.image_url ?? '').trim(),
    created_at: String(course.created_at ?? ''),
    updated_at: String(course.updated_at ?? ''),
  };
}

async function request(path, options) {
  var requestOptions = options || {};
  var headers = {
    Accept: 'application/json',
  };
  var response;
  var contentType;
  var payload;

  if (requestOptions.body) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    response = await window.fetch(API_BASE_URL + path, {
      method: requestOptions.method || 'GET',
      headers: headers,
      body: requestOptions.body || undefined,
    });
  } catch (error) {
    throw createRequestError('No se pudo conectar con el backend', 0, []);
  }

  if (response.status === 204) {
    return null;
  }

  contentType = response.headers.get('content-type') || '';
  payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw createRequestError(
      payload && payload.error && payload.error.message
        ? payload.error.message
        : 'No se pudo completar la solicitud',
      response.status,
      payload && payload.error ? payload.error.details : []
    );
  }

  return payload;
}

function buildListQuery(params) {
  var query = params || {};
  var searchParams = new URLSearchParams();

  searchParams.set('page', String(query.page || 1));
  searchParams.set('limit', String(query.limit || 100));
  searchParams.set('sort', String(query.sort || 'created_at'));
  searchParams.set('order', String(query.order || 'desc'));

  if (query.q) {
    searchParams.set('q', String(query.q).trim());
  }

  return searchParams.toString();
}

async function loadCourses(params) {
  var queryString = buildListQuery(params);
  var payload = await request('/courses?' + queryString, { method: 'GET' });

  return Array.isArray(payload.data)
    ? payload.data
        .map(function mapCourse(course) {
          return normalizeCourse(course);
        })
        .filter(Boolean)
    : [];
}

async function getCourseById(courseId) {
  var payload = await request('/courses/' + encodeURIComponent(courseId), {
    method: 'GET',
  });

  return normalizeCourse(payload.data);
}

async function createCourse(course) {
  var payload = await request('/courses', {
    method: 'POST',
    body: JSON.stringify(course),
  });

  return normalizeCourse(payload.data);
}

async function updateCourse(courseId, course) {
  var payload = await request('/courses/' + encodeURIComponent(courseId), {
    method: 'PUT',
    body: JSON.stringify(course),
  });

  return normalizeCourse(payload.data);
}

async function deleteCourse(courseId) {
  await request('/courses/' + encodeURIComponent(courseId), {
    method: 'DELETE',
  });
}

function getCategories(courses) {
  return ['Todas'].concat(
    Array.from(
      new Set(
        courses
          .map(function mapCategory(course) {
            return course.category;
          })
          .filter(Boolean)
      )
    )
  );
}

function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(price));
}

function formatLevel(level) {
  var labels = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  };

  return labels[level] || level;
}

function buildCourseFormPayload(formData) {
  var durationValue = String(formData.get('duration_hours') || '').trim();
  var descriptionValue = String(formData.get('description') || '').trim();
  var imageUrlValue = String(formData.get('image_url') || '').trim();

  return {
    title: String(formData.get('title')).trim(),
    instructor: String(formData.get('instructor')).trim(),
    platform: String(formData.get('platform')).trim(),
    category: String(formData.get('category')).trim(),
    level: String(formData.get('level')).trim(),
    price: Number(formData.get('price')),
    duration_hours: durationValue === '' ? null : Number(durationValue),
    lessons: Number(formData.get('lessons')),
    language: String(formData.get('language')).trim(),
    description: descriptionValue,
    image_url: imageUrlValue,
  };
}

window.CourseStore = {
  apiBaseUrl: API_BASE_URL,
  buildCourseFormPayload: buildCourseFormPayload,
  createCourse: createCourse,
  deleteCourse: deleteCourse,
  formatLevel: formatLevel,
  formatPrice: formatPrice,
  getCategories: getCategories,
  getCourseById: getCourseById,
  loadCourses: loadCourses,
  updateCourse: updateCourse,
};
