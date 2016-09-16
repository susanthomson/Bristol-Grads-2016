module.exports = function (grunt) {
    grunt.loadNpmTasks("grunt-concurrent");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-jscs");
    grunt.loadNpmTasks("grunt-jasmine-nodejs");

    var files = ["Gruntfile.js", "server.js", "server/**/*.js", "spec/**/*.js", "client/**/*.js"];

    var serveProc = null;

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
        },
        watch: {
            serve: {
                files: ["server.js", "server/**/*.js", "test/**/*.js"],
                tasks: ["check", "restartServer"],
                options: {
                    atBegin: true,
                    spawn: false,
                },
            },
            client: {
                files: ["client/**/*.js", "test/**/*.js"],
                tasks: ["check"],
                options: {
                    atBegin: true,
                    spawn: false,
                },
            }
        },
        concurrent: {
            watch: {
                tasks: ["watch:serve", "watch:client"],
                options: {
                    logConcurrentOutput: true
                }
            }
        },
        jasmine_nodejs: {
            options: {
                specNameSuffix: "spec.js",
            },
            client_tests: {
                specs: [
                    "spec/**/*.js"
                ]
            }
        }
    });

    grunt.event.on("watch", function (action, filepath, target) {
        grunt.config("jshint.all", filepath);
        grunt.config("jscs.all", filepath);
    });

    grunt.registerTask("startServer", "Task that starts a server attached to the Grunt process.", function () {
        var cmd = process.execPath;
        process.env.DEV_MODE = true;
        serveProc = grunt.util.spawn({
            cmd: cmd,
            args: ["server.js"]
        }, function (err) {
            return err;
        });
        serveProc.stdout.pipe(process.stdout);
        serveProc.stderr.pipe(process.stderr);
    });
    grunt.registerTask("killServer", "Task that stops the server if it is running.", function () {
        if (serveProc) {
            serveProc.kill();

        }
    });
    grunt.registerTask("runApp", ["concurrent:watch"]);
    grunt.registerTask("restartServer", ["killServer", "startServer"]);
    grunt.registerTask("check", ["jshint", "jscs"]);
    grunt.registerTask("test", "check");
    grunt.registerTask("default", "test");
};
