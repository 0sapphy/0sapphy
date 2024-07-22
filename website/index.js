const app = require('express')();

app.get('/', (req, res) => {
    res.send('Hi');
});

app.listen(3000, () => {
    console.info(`[INFO]: Loaded webserver on port 3000`);
});