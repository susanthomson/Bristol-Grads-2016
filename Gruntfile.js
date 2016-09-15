module.exports = function(grunt) {
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-jscs");

    var files = ["Gruntfile.js", "server.js", "server/**/*.js", "test/**/*.js", "client/**/*.js"];

    grunt.initConfig({
        jshint: {
            all: files,
            options: {
                jshintrc: true
            }
        },
        jscs: {
            all: files,
            options: {
                config: ".jscsrc",
                fix: true
            }
        }
    });

    grunt.registerTask("check", ["jshint", "jscs"]);
    grunt.registerTask("test", ["check"]);
    grunt.registerTask("default", "test");
};
