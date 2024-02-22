module.exports = function (grunt) {
  grunt.loadNpmTasks("grunt-prompt");
  grunt.loadNpmTasks("grunt-exec");
  grunt.initConfig({
    prompt: {
      version: {
        options: {
          questions: [
            {
              config: "version",
              type: "input",
              message: "Enter new version number",
            },
          ],
          then: function (results) {
            grunt.config.set("version", results.version);
            console.log('Version set to: ' + grunt.config.get("version"))
          },
        },
      },
    },
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
      buildQuasar: {
        cwd: './q-manui',
        command: 'quasar build',
      },
      spa: {
        command: 'deno run -A prepare-spa.ts --action spa',
      },
    },
  });

  grunt.registerTask("publish", [
    "prompt:version",
    "exec:fmt",
    "exec:lint",
    "exec:setVersion",
    "exec:buildQuasar",
    "exec:spa",
  ]);
};
