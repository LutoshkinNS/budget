import appInit from "#src/appInit.ts";
import categoriesModule from "#src/domains/categories/categories.ts";
import expensesModule from "#src/domains/expenses/expenses.ts";

const app = await appInit();

app.register(categoriesModule, { prefix: '/categories' });
app.register(expensesModule, { prefix: '/expenses' });

app.listen({
    port: 3000,
    host: '0.0.0.0'
}, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})

app.log.debug(
    app.initialConfig,
    'Fastify listening with the config'
);