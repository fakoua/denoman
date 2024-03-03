module.exports = function (grunt) {
  grunt.loadNpmTasks("grunt-exec");
  grunt.initConfig({
    exec: {
      fmt: {
        command: "deno fmt",
      },
      lint: {
        command: "deno lint",
      },
      setVersion: {
        command: 'deno run -A prepare-spa.ts --action set-version --version <%= grunt.config.get("version") %>',
      },
      testQuasar: {
        cwd: './q-manui',
        command: 'yarn cov',
      },
      buildQuasar: {
        cwd: './q-manui',
        command: 'quasar build',
      },
      spa: {
        command: 'deno run -A prepare-spa.ts --action spa',
      },
      sonar: {
        command: 'sonar-scanner.bat  -D"sonar.organization=fakoua"  -D"sonar.projectKey=fakoua_denoman"  -D"sonar.sources=."  -D"sonar.host.url=https://sonarcloud.io"',
      },
    },
  });

  //Run grunt publish to publish a new version
  //This will prompt for a new version number
  grunt.registerTask("prompt", "Prompt for version", function () {
    const done = this.async();
    grunt.log.writeln("Prompting for version");
    const prompt = require("prompt");
    prompt.start();
    prompt.get(["version"], function (err, result) {
      if (err) {
        return done(err);
      }
      grunt.config.set("version", result.version);
      done();
    });
  });

  grunt.registerTask("publish", [
    "prompt",
    "exec:fmt",
    "exec:lint",
    "exec:setVersion",
    "exec:testQuasar",
    "exec:buildQuasar",
    "exec:spa",
    "exec:sonar",
  ]);
};
