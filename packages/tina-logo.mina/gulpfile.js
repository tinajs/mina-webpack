const gulp = require('gulp')
const del = require('del')
const babel = require('gulp-babel')
const postcss = require('gulp-postcss')
const uglify = require('gulp-uglify')
const jsonMinify = require('gulp-json-minify')
const cleanCSS = require('gulp-clean-css')
const mina = require('@tinajs/gulp-mina')
const merge = require('merge2')
const precss = require('precss')

gulp.task('default', ['clean'], () => {
  return merge(
    [
      gulp.src('src/**/*.mina')
        .pipe(mina({
          script: (stream) => stream.pipe(babel({ presets: ['env'] })).pipe(uglify()),
          config: (stream) => stream.pipe(jsonMinify()),
          style: (stream) => stream.pipe(postcss([ precss ])).pipe(cleanCSS()),
        })),
      gulp.src('src/**/*.png'),
    ]
  )
    .pipe(gulp.dest('./dist'))
})

gulp.task('clean', () => del(['./dist']))
