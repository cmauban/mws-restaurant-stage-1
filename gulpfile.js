// Include gulp
var gulp = require('gulp');

// Include Our Plugins
// var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();

// Static server browser-sync
gulp.task('default', ['sass'], function() {
    gulp.watch('scss/*.scss', ['sass']);

    browserSync.init({
        server: {
            server: "./"
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
        .pipe(gulp.dest('./css'))
        .pipe(browserSync.strem());
});

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
gulp.task('default', ['sass']);
