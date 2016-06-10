/*eslint-env node */
// INSTALL some tools
// npm install --global gulp-cli
// Skip if already installed
// npm install --save-dev gulp
// npm install --save-dev gulp-sass
// npm install --save-dev gulp-autoprefixer
// npm install --save-dev browser-sync --msvs_version=2013
// npm install --save-dev gulp-eslint
// npm install --save-dev gulp-concat
// npm install --save-dev gulp-imagemin
// npm install --save-dev imagemin-pngquant
// npm install --save-dev gulp-uglify

// Sets eslint standards
// eslint --init

var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var eslint = require('gulp-eslint');
var concat = require('gulp-concat');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var uglify = require('gulp-uglify');


gulp.task('default', ['copy-index', 'copy-images', 'scripts', 'sass-styles', 'es-lint'], function () {
    // Watch for changes. sass styles, index, images and javascripts
    gulp.watch('src/sass/**/*.scss', ['sass-styles'])
        .on('change', function (event) { console.log('sass-styles: File: ' + event.path + ' was ' + event.type + ', running tasks...'); });
    gulp.watch('src/index.html', ['copy-index'])
        .on('change', function (event) { console.log('copy-index ' + event.path + ' was ' + event.type + ', running tasks...'); });
    gulp.watch('src/img/**/*', ['copy-images'])
        .on('change', function (event) { console.log('copy-images ' + event.path + ' was ' + event.type + ', running tasks...'); });
    gulp.watch('src/js/**/*.js', ['scripts'])
        .on('change', function (event) { console.log('scripts ' + event.path + ' was ' + event.type + ', running tasks...'); });

    // eslint watch src. Could pipe Browser-sync reload onto that
    gulp.watch('./src/js/**/*.js', ['es-lint']);

    browserSync.init({
        server: {
            baseDir: './dist',
            index: 'index.html'
        }

    });
	/*
	browserSync.init({
        proxy: 'localhost:3000',
    });
	*/
    // Browser-sync watch dist. index.html and js files.
    gulp.watch('./dist/js/**/*.js').on('change', browserSync.reload);
    gulp.watch('./dist/index.html').on('change', browserSync.reload);
    gulp.watch('./dist/img/**/*').on('change', browserSync.reload);
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
        .pipe(gulp.dest('dist/css'))
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
        .pipe(gulp.dest('dist/js'));
});

// Move files to dist folder
gulp.task('copy-index', function () {
    gulp.src('src/index.html')
        .pipe(gulp.dest('./dist'));
});
gulp.task('copy-images', function () {
    gulp.src('src/img/*')
        .pipe(gulp.dest('dist/img'));
});


// Build js for deploy. Minify 'scripts' task
gulp.task('deploy-scripts', function () {
    gulp.src('src/js/**/*.js')
        .pipe(concat('javascript.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));
});
gulp.task('deploy-images', function () {
    gulp.src('src/img/*')
        .pipe(imagemin({
            progressive: true,
            use: [pngquant()]
        }))
        .pipe(gulp.dest('dist/img'));
});
// Builds all stuffs for deployment
// Only minified js for now. Maybe delete all useless stuffs in future
gulp.task('deploy', [
    'copy-index',
    'deploy-images',
    'sass-styles',
    'es-lint',
    'deploy-scripts'
]);