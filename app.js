const config = require('config');
const cors = require('cors');
const express = require('express');
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./helpers/swagger.json');
const index = require('./routes/index');
require('./startup/prod')(app);

// add cors
app.use(cors());
app.options('*', cors());

// Load body parser
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/api-docs', swaggerUi.serveFiles(swaggerDocument, {}), swaggerUi.setup(swaggerDocument));
// Load routers
//app.use('/', home);
app.use('/api/v1', index);

//cronjob.startCronJob();
// executeTrigger();
// startDynamicCronJob();
//stockJob.test()
const port = process.env.PORT || 8881;
app.listen(port, () => console.log(`Listning on port ${port}.....`));
//module.exports = app
app.timeout = 0; //Set to 0 to disable any kind of automatic timeout behavior on incoming connections.