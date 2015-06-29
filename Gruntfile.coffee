module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')

    coffee:
      compile:
        expand: true
        flatten: true
        src: ['coffee/*.coffee']
        dest: 'js/'
        ext: '.js'

    watch:
      options:
        atBegin:
          true
      coffee:
        files: ['coffee/*', 'sass/*']
        tasks: ['coffee', 'uglify', 'compass']

    uglify:
      options:
        banner: '/*! <%= pkg.name %> <%= pkg.version %> */\n'

      minified:
        src: ['js/*', '!js/snake.js']
        dest: 'offline.min.js'

      original:
        src: ['js/*', '!js/snake.js']
        dest: 'offline.js'
        options:
          mangle: false
          beautify:
            beautify: true
            indent_level: 2
            space_colon: false

    compass:
      dist:
        options:
          sassDir: 'sass'
          cssDir: 'themes'

  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-compass'

  grunt.registerTask 'default', ['coffee', 'uglify', 'compass']
