module.exports = function(grunt) {

  "use strict";

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true,
        trailing: true,
        asi: true,
        strict: true,
        globals: {
          jQuery: true,
          module: true
        }
      },
      all: ['Gruntfile.js', 'zoominous.js']
    },

    uglify: {
      options: {
        banner: "/* <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today(\"yyyy-mm-dd\") %>\n" +
                " * <%= pkg.description %>\n" +
                " * <%= pkg.repository.url %>\n" +
                " * <%= pkg.author %>  */\n"
      },
      deploy: {
        files: {
          'zoominous.min.js' : 'zoominous.js'
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.registerTask('deploy', ['jshint', 'uglify:deploy']);

};