const express = require('express');
const routes = require('./routes');
const app = express();


const port = process.env.PORT || 5000;
const localhost = process.env.LOCALHOST || 'localhost';

app.use('/', routes);

app.listen(port, localhost, () => {
    console.log(`listening on port ${port}`);
});
