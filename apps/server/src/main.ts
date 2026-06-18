import appInit from '#src/appInit.js';
import accountsRoutes from '#src/domains/accounts/routes.js';
import authRoutes from '#src/domains/auth/routes.js';
import categoriesModule from '#src/domains/categories/categories.js';
import subcategoriesModule from '#src/domains/subcategories/subcategories.js';
import transactionsModule from '#src/domains/transactions/transactions.js';

const app = await appInit();

app.register(authRoutes, { prefix: '/api/v1/auth' });
app.register(accountsRoutes, { prefix: '/api/v1/accounts' });
app.register(categoriesModule, { prefix: '/api/v1/categories' });
app.register(subcategoriesModule, { prefix: '/api/v1/subcategories' });
app.register(transactionsModule, { prefix: '/api/v1/transactions' });

app.listen(
  {
    port: 3000,
    host: '0.0.0.0'
  },
  (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Server listening at ${address}`);
  }
);

app.log.debug(app.initialConfig, 'Fastify listening with the config');
