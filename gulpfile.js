// Include gulp
var gulp = require('gulp');

// Include Our Plugins
// var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var eslint = require('gulp-eslint');
var jasmine = require('gulp-jasmine-phantom');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var imagemin = require('imagemin');
var pngquant = require('imagemin-pngquant');

// Static server browser-sync
gulp.task('default', ['copy-html', 'copy-images', 'sass', 'lint'], function() {
    gulp.watch('src/scss/*.scss', ['sass']);
    gulp.watch('src/js/*.js', ['lint']);
    gulp.watch('src/*.html', ['copy-html']);
    gulp.watch('./dist/*.html')
      .on('change', browserSync.reload);

    browserSync.init({
      server: {
          baseDir: "./dist"
      }
    });

});

// Start browserSync
gulp.task('start', function(){
  browserSync.init({
    server: {
        baseDir: "./dist"
    }
  });
});

// Production ready - add to dist folder `gulp dist`
gulp.task('dist', [
  'copy-html',
  'copy-images',
  'copy-data',
  'copy-sw',
  'sass',
  'scripts-dist'
]);

// gulp.task('lint', function() {
//   gulp.src('src/js/*.js')
//     .pipe(eslint())
//     .pipe(eslint.format())
//     .pipe(eslint.failOnError());
// });

// Compile sass into CSS + auto-inject into browsers
gulp.task('sass', function() {
    gulp.src('src/scss/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
          browsers: ['last 2 versions']
        }))
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.stream());
});

// Copy index.html to dist folder
gulp.task('copy-html', function() {
  gulp.src('src/*.html')
    .pipe(gulp.dest('./dist'));
});

// Compress & Copy images to dist folder
gulp.task('copy-images', function() {
  gulp.src('src/img/*')
    // .pipe(imagemin({
    //   progressive: true,
    //   use: pngquant()
    // })) // TODO: GET THIS WORKING
    .pipe(gulp.dest('dist/img'));
});

gulp.task('copy-data', function(){
  gulp.src('data/*')
    .pipe(gulp.dest('dist/data'));
});

gulp.task('copy-sw', function(){
  gulp.src('src/sw.js')
    .pipe(gulp.dest('./dist'));
})

// Concatenate & Minify JS
gulp.task('scripts', function(){
  gulp.src('src/js/*.js')
    .pipe(concat('all.js'))
    .pipe(gulp.dest('dist/js'));
});

// Concatenate & Minify JS for PRODUCTION
gulp.task('scripts-dist', function(){
  gulp.src('src/js/*.js')
    .pipe(sourcemaps.init())
    .pipe(concat('all.js'))
    // .pipe(uglify().on('error', function(e){
      // console.log(e);
    // })) // minifcation // TODO: GET THIS WORKING
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/js'));
});

// TODO: add tests and make sure function work
gulp.task('test', function() {
  gulp.src('tests/spec/extraSpec.js')
    .pipe(jasmine({
      integration: true,
      vendor: 'src/js/*.js'
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
gulp.task('default', ['sass', 'copy-html', 'copy-data', 'scripts']);
