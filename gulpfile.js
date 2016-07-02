/*eslint-env node */
// REQUIRE
// npm install --global gulp-cli

// INSTALL following npm packages or use npm install with package.json
// gulp
// gulp-sass
// gulp-autoprefixer
// browser-sync --msvs_version=2013
// gulp-eslint
// gulp-concat
// gulp-imagemin
// imagemin-pngquant
// gulp-uglify

// Sets eslint standards
// eslint --init

// uglify don't seems to work with ES6 stufsf yet.

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
var clean = require('gulp-clean');

var dist = './dist';
var deployLocation = './';

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
            baseDir: dist,
            index: 'index.html'
        }

    });
    /*
    browserSync.init({
        proxy: 'localhost:3000',
    });
    */
    // Browser-sync watch dist. index.html and js files.
    gulp.watch(dist + '/js/**/*.js').on('change', browserSync.reload);
    gulp.watch(dist + '/index.html').on('change', browserSync.reload);
    gulp.watch(dist + '/img/**/*').on('change', browserSync.reload);
});

// Process scss into css file.
// pipes: print error -> web-kit autoprefixer -> compress/minify -> output to destination -> browserSync stream
gulp.task('sass-styles', function () {
    return gulp.src('src/sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        .pipe(gulp.dest(dist + '/css'))
        .pipe(browserSync.stream());
});
// JavaScript linting using es-lint.
gulp.task('es-lint', function () {
    return gulp.src(['src/js/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});

gulp.task('scripts', function () {
    gulp.src('src/js/**/*.js')
        .pipe(concat('javascript.js'))
        .pipe(gulp.dest(dist + '/js'));
});
// Move files to dist folder
gulp.task('copy-html', function () {
    gulp.src('src/**/*.html')
        .pipe(gulp.dest(dist));
});
gulp.task('copy-images', function () {
    gulp.src('src/img/*')
        .pipe(gulp.dest(dist + '/img'));
});


// TODO: Minify later
gulp.task('deploy-html', function () {
    gulp.src('src/**/*.html')
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
    gulp.src(['src/img/**/*.png', 'src/img/**/*.PNG'])
        .pipe(imagemin({
            progressive: true,
            use: [pngquant()]
        }))
        .pipe(gulp.dest(deployLocation + '/img'));
});
gulp.task('deploy-images-jpg', function () {
    gulp.src(['src/img/**/*.jpg', 'src/img/**/*.jpeg'])
        .pipe(imagemin({
            progressive: true,
            use: [jpegtran()]
        }))
        .pipe(gulp.dest(deployLocation + '/img'));
});
gulp.task('deploy-scripts', function () {
    gulp.src('src/js/**/*.js')
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

gulp.task('clean-deploy', function () {
    return gulp.src(['./index.html', './js', './css', './subpages', './images'])
        .pipe(clean());
});