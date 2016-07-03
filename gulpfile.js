/*eslint-env node */
// REQUIRE
// npm install --global gulp-cli

// Sets eslint standards
// eslint --init

// uglify don't seems to work with ES6 stuffs yet.

var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var eslint = require('gulp-eslint');
var concat = require('gulp-concat');
var imagemin = require('gulp-imagemin');
var jpegtran = require('imagemin-jpegtran');
var pngquant = require('imagemin-pngquant');
var uglify = require('gulp-uglify');

var devLocation = './devLocation';
var deployLocation = './dist';

gulp.task('default', ['copy-html', 'copy-images', 'scripts', 'sass-styles', 'es-lint'], function () {
    // Watch for changes. sass styles, index, images and javascripts
    gulp.watch('src/sass/**/*.scss', ['sass-styles'])
        .on('change', function (event) { console.log('sass-styles: File: ' + event.path + ' was ' + event.type + ', running tasks...'); });
    gulp.watch('src/**/*.html', ['copy-html'])
        .on('change', function (event) { console.log('copy-html ' + event.path + ' was ' + event.type + ', running tasks...'); });
    gulp.watch('src/img/**/*', ['copy-images'])
        .on('change', function (event) { console.log('copy-images ' + event.path + ' was ' + event.type + ', running tasks...'); });
    gulp.watch('src/js/**/*.js', ['scripts'])
        .on('change', function (event) { console.log('scripts ' + event.path + ' was ' + event.type + ', running tasks...'); });

    // eslint watch src. Could pipe Browser-sync reload onto that
    gulp.watch('./src/js/**/*.js', ['es-lint']);

    browserSync.init({
        server: {
            baseDir: devLocation,
            index: 'index.html'
        }

    });
    /*
    browserSync.init({
        proxy: 'localhost:3000',
    });
    */
    gulp.watch(devLocation + '/**/*.html').on('change', browserSync.reload);
    gulp.watch(devLocation + '/css/**/*.css').on('change', browserSync.reload);
    gulp.watch(devLocation + '/js/**/*.js').on('change', browserSync.reload);
    gulp.watch(devLocation + '/img/**/*').on('change', browserSync.reload);
});
gulp.task('sass-styles', function () {
    return gulp.src('src/sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        .pipe(gulp.dest(devLocation + '/css'));
});
gulp.task('es-lint', function () {
    return gulp.src(['src/js/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});
gulp.task('scripts', function () {
    return gulp.src('src/js/**/*.js')
        .pipe(concat('javascript.js'))
        .pipe(gulp.dest(devLocation + '/js'));
});
gulp.task('copy-html', function () {
    return gulp.src('src/**/*.html')
        .pipe(gulp.dest(devLocation));
});
gulp.task('copy-images', function () {
    return gulp.src('src/img/*')
        .pipe(gulp.dest(devLocation + '/img'));
});

// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //

// TODO: Minify later
gulp.task('deploy-html', function () {
    return gulp.src('src/**/*.html')
        .pipe(gulp.dest(deployLocation));
});
gulp.task('deploy-styles', function () {
    return gulp.src('src/sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        .pipe(gulp.dest(deployLocation + '/css'));
});
gulp.task('deploy-images-png', function () {
    return gulp.src(['src/img/**/*.png', 'src/img/**/*.PNG'])
        .pipe(imagemin({
            progressive: true,
            use: [pngquant()]
        }))
        .pipe(gulp.dest(deployLocation + '/img'));
});
gulp.task('deploy-images-jpg', function () {
    return gulp.src(['src/img/**/*.jpg', 'src/img/**/*.jpeg'])
        .pipe(imagemin({
            progressive: true,
            use: [jpegtran()]
        }))
        .pipe(gulp.dest(deployLocation + '/img'));
});
gulp.task('deploy-scripts', function () {
    return gulp.src('src/js/**/*.js')
        .pipe(concat('javascript.js'))
        .pipe(uglify())
        .pipe(gulp.dest(deployLocation + '/js'));
});

// Builds all stuffs for deployment
// Only minified js for now. Maybe delete all useless stuffs in future
gulp.task('deploy', [
    'deploy-html',
    'deploy-styles',
    'deploy-images-png',
    'deploy-images-jpg',
    'deploy-scripts'
]);