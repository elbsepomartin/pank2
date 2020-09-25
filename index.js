const express = require('express');
const mongoose = require('mongoose');
const {RequestHeadersHaveCorrectContentType, RequestBodyIsValidJson, enableCORS} = require('./middlewares');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/api.json');

// Start Express
const app = express();

// Dotenv config
require('dotenv').config();

// Middlewares
app.use(enableCORS);
app.use(RequestHeadersHaveCorrectContentType);
app.use(express.json()); // Parse request body if's JSON
app.use(RequestBodyIsValidJson)
app.use(express.urlencoded({extended: true})); // Parse request body if's key=and&value=pairs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Database connection
mongoose.connect(process.env.DB_CONNECTION,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },
    () => console.log('connected to DB!')
);

// Routes
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Port listen
app.listen(process.env.PORT);