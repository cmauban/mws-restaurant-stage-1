// Include gulp
var gulp = require('gulp');

// Include Our Plugins
// var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var jasmine = require('gulp-jasmine-phantom');

// Static server browser-sync
gulp.task('default', ['copy-html', 'copy-images', 'sass'], function() {
    gulp.watch('scss/*.scss', ['sass']);
    gulp.watch('/index.html', ['copy-html']);

    browserSync.init({
      server: {
          baseDir: "./dist"
      }
    });

    gulp.watch('./dist/index.html')
      .on('change', browserSync.reload);
});

// Start browserSync
gulp.task('start', function(){
  browserSync.init({
    server: {
        baseDir: "./dist"
    }
  });
});

// Compile sass into CSS + auto-inject into browsers
gulp.task('sass', function() {
    gulp.src('scss/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
          browsers: ['last 2 versions']
        }))
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.stream());
});

// Copy index.html to dist folder
gulp.task('copy-html', function() {
  gulp.src('./index.html')
    .pipe(gulp.dest('./dist'));
});

// Copy images to dist folder
gulp.task('copy-images', function() {
  gulp.src('img/*')
    .pipe(gulp.dest('dist/img'));
});

// TODO: add tests and make sure function work
gulp.task('test', function() {
  gulp.src('tests/spec/extraSpec.js')
    .pipe(jasmine({
      integration: true,
      vendor: 'js/*.js'
    }));
})
// Concatenate & Minify JS
// gulp.task('scripts', function() {
//     return gulp.src('js/*.js')
//         .pipe(concat('all.js'))
//         .pipe(gulp.dest('dist'))
//         .pipe(rename('all.min.js'))
//         .pipe(uglify())
//         .pipe(gulp.dest('dist/js'));
// });
//

// Default Task
gulp.task('default', ['start', 'sass']);
