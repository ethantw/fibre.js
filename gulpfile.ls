
require! <[ gulp ]>
connect = require \gulp-connect
concat = require \gulp-concat-util
lsc = require \gulp-livescript
browserify = require \gulp-browserify
jade = require \gulp-jade
watch = require \gulp-watch
pkg = require \./package.json

const VERSION = pkg.version

src = -> gulp.src( it ).pipe( watch( it ))

gulp.task \server !->
  connect.server {
    port: 5678
    livereload: true
  }

gulp.task \build !->
  gulp.src <[ src/intro.js src/fibre.js src/post-expose.js src/fardt.js src/outro.js ]>
    .pipe concat \fibre.js {
      process: ( src ) ->
        src.replace /@VERSION/, VERSION 
    }
    .pipe concat.header """
          /*!
           * Fibre.js v#{VERSION} | MIT License | github.com/ethantw/fibre.js
           * Based on findAndReplaceDOMText
           */\n
      """
    .pipe gulp.dest \./dist/

gulp.task \test !->
  src \test/main.ls
    .pipe lsc!
    .pipe browserify!
    .pipe gulp.dest \./test/
  src \test/*.jade
    .pipe jade { +pretty }
    .pipe gulp.dest \./test/

gulp.task \watch <[ test ]> !->
  gulp.watch \src/*.js <[ build ]>

gulp.task \default <[ server build watch ]>

