/*eslint-env node */
// INSTALL
// npm install --global gulp-cli
// Skip if already installed
// npm install --save-dev gulp
// npm install --save-dev gulp-sass
// npm install --save-dev gulp-autoprefixer
// npm install --save-dev browser-sync --msvs_version=2013
// npm install --save-dev gulp-eslint
// eslint --init
// npm install --save-dev gulp-jasmine-phantom
// Require phantomjs


var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var eslint = require('gulp-eslint');
// var jasmine = require('gulp-jasmine-phantom');


gulp.task('default', ['styles', 'lint'], function () {

    browserSync.init({
        server: './'
    });

    // Sass watch.
    gulp.watch('sass/**/*.scss', ['styles'])
        .on('change', function (event) {
            console.log('File' + event.path + ' was ' + event.type + ', running tasks...');
        });

    // eslint watch. Could pipe Browser-sync reload onto that
    gulp.watch('js/**/*.js', ['lint']);
    // Browser-sync watch. index.html and js files.
    gulp.watch('index.html').on('change', browserSync.reload);
    gulp.watch('js/**/*.js').on('change', browserSync.reload);

});

gulp.task('styles', function () {

    return gulp.src('sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(gulp.dest('./css'))
        .pipe(browserSync.stream());

});

gulp.task('lint', function () {

    return gulp.src(['js/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());

});

// gulp.task('tests', function () {

//     return gulp.src('tests/spec/extraSpec.js')
//         .pipe(jasmine({
//             integration: true,
//             jasmineVersion: '2.4',
//             vendor: 'js/**/*.js'
//         }));
// });
