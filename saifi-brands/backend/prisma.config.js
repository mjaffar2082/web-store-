const { defineConfig } = require('prisma/config');

module.exports = defineConfig({
  datasource: {
    url: 'file:./saifi.db',
  },
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
});
