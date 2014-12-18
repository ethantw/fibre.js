
require! <[ gulp ]>
connect = require \gulp-connect
concat = require \gulp-concat-util
pkg = require \./package.json

const VERSION = pkg.version

gulp.task \server !->
  connect.server {
    port: 5678
    livereload: true
  }

gulp.task \build !->
  gulp.src <[ src/intro.js src/fibre.js src/expose.js src/fardt.js src/outro.js ]>
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

gulp.task \watch !->
  gulp.watch \src/*.js <[ build ]>

gulp.task \default <[ server build watch ]>

