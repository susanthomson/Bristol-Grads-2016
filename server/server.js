var express = require("express");

module.exports = function(port) {
    var app = express();

    app.use(express.static("public"));

    return app.listen(port);
};
