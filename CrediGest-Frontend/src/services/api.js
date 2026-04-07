const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const handleError = (status, data) => {
  if (status === 404) {
    console.error("Recurso não encontrado:", data);
  } else if (status === 400) {
    console.error("Erro na validação dos dados:", data);
  } else if (status === 500) {
    console.error("Erro no servidor:", data);
  }
};

const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = await response.text();
      }
      handleError(response.status, errorData);
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const contentLength = response.headers.get("content-length");
    if (contentLength === "0" || !response.body) {
      return {};
    }

    try {
      return await response.json();
    } catch (e) {
      return {};
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
    throw error;
  }
};

const api = {
  get: (endpoint) => request(endpoint, { method: "GET" }),

  post: (endpoint, data) =>
    request(endpoint, { method: "POST", body: JSON.stringify(data) }),

  patch: (endpoint, data) =>
    request(endpoint, { method: "PATCH", body: JSON.stringify(data) }),

  put: (endpoint, data) =>
    request(endpoint, { method: "PUT", body: JSON.stringify(data) }),

  delete: (endpoint) => request(endpoint, { method: "DELETE" }),
};

export default api;
