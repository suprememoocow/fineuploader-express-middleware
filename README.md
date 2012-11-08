fineuploader-express-middleware
===============================

Express middleware for [fineuploader (aka valums file uploader)](http://fineuploader.com/)

To use
======

Install the middleware: `npm install fineuploader-express-middleware`

Then simply include the middleware after the express bodyParser middleware in your express application, like so:

    var fineuploaderExpressMiddleware = require('fineuploader-express-middleware');

    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(fineuploaderExpressMiddleware({ uploadDir: '/tmp ' }));

Files will be available in `req.files`.
