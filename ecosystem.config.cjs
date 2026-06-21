module.exports = {
  apps: [
    {
      name: "importer-app",
      script: "./dist/server.cjs",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        // aaPanel will pass these or they can be configured in the Node project settings
        // SQL_HOST: "localhost",
        // SQL_USER: "postgres",
        // SQL_PASSWORD: "yourpassword",
        // SQL_DB_NAME: "yourdb",
      }
    }
  ]
};
