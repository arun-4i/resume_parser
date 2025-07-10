export const openApiBaseConfig = {
  openapi: "3.0.3",
  info: {
    title: "Backend Boilerplate API",
    description: "Enterprise-grade backend API documentation (auto-generated)",
    version: "1.0.0",
    contact: {
      name: "Your Company",
      email: "support@example.com",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: "/api/v1",
      description: "Main API server (v1)",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          "JWT Authorization header using the Bearer scheme. Example: 'Authorization: Bearer {token}'",
      },
    },
  },
  security: [{ bearerAuth: [] }],
};
