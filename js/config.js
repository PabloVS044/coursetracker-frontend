(function bootstrapCourseTrackerConfig() {
  var LOCAL_API_BASE_URL = 'http://localhost:3000';
  var PRODUCTION_API_BASE_URL = 'https://coursetracker-backend.vercel.app';
  var API_BASE_URL_STORAGE_KEY = 'coursetracker.apiBaseUrl';

  function normalizeBaseUrl(value) {
    if (!value) {
      return '';
    }

    return String(value).trim().replace(/\/+$/, '');
  }

  function getQueryOverride() {
    var params = new URLSearchParams(window.location.search);
    return normalizeBaseUrl(params.get('apiBaseUrl'));
  }

  function isLocalFrontend(hostname, protocol) {
    return (
      protocol === 'file:' ||
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1'
    );
  }

  function resolveDefaultApiBaseUrl() {
    if (isLocalFrontend(window.location.hostname, window.location.protocol)) {
      return LOCAL_API_BASE_URL;
    }

    return PRODUCTION_API_BASE_URL;
  }

  function resolveApiBaseUrl() {
    var queryOverride = getQueryOverride();
    var storedOverride = normalizeBaseUrl(window.localStorage.getItem(API_BASE_URL_STORAGE_KEY));
    var defaultApiBaseUrl = resolveDefaultApiBaseUrl();

    if (queryOverride) {
      window.localStorage.setItem(API_BASE_URL_STORAGE_KEY, queryOverride);
      return queryOverride;
    }

    if (storedOverride) {
      return storedOverride;
    }

    return defaultApiBaseUrl;
  }

  window.CourseTrackerConfig = {
    apiBaseUrl: resolveApiBaseUrl(),
    localApiBaseUrl: LOCAL_API_BASE_URL,
    productionApiBaseUrl: PRODUCTION_API_BASE_URL,
    resetApiBaseUrlOverride: function resetApiBaseUrlOverride() {
      window.localStorage.removeItem(API_BASE_URL_STORAGE_KEY);
    },
  };
})();
