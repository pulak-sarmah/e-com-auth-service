import express from 'express';

const app = express();

app.get('/', (req, res) => {
    res.send('AUTH SERVICE IS RUNNING');
});

export { app };
