import fastify from 'fastify'

const serverOptions = {
    logger: {
        level: 'info',
    },
};

const app = fastify(serverOptions)

app.get('/ping', async (request, reply) => {
    return 'pong\n'
})

app.get('/health', async (request, reply) => {
    return { status: 'ok', message: 'Server is running' }
})

app.route({
    url: '/hello',
    method: 'GET',
    handler: function myHandler(request, reply) {
        reply.send('world');
    },
});

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