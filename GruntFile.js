module.exports = function(grunt) {
    grunt.initConfig({
        pkg : grunt.file.readJSON('package.json'),
        jshint : {
            myFiles : ['./server.js','./lib/routes.js']
        },
        nodemon : {
            script : 'server.js'
        },
        env : {
            dev : {
              src : "env.bat"
            }
          }
    });
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.registerTask('default', ['env:dev', 'nodemon']);
};