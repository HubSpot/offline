Path = require('path')
fs = require('fs')

module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON("package.json")

    coffee:
      compile:
        files:
          'offline.js': 'offline.coffee'
          'pegasus.js': 'pegasus.coffee'
          'ui.js': 'ui.coffee'
          'reconnect.js': 'reconnect.coffee'

    watch:
      coffee:
        files: ['offline.coffee', 'pegasus.coffee', 'ui.coffee', 'reconnect.coffee']
        tasks: ["coffee", "uglify"]

    uglify:
      options:
        banner: "/*! <%= pkg.name %> <%= pkg.version %> */\n"

      dist:
        src: 'offline.js'
        dest: 'offline.min.js'

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
