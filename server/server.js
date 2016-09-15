var express = require("express");

module.exports = function(port) {
    var app = express();

    app.use(express.static("client"));

    return app.listen(port);
};
