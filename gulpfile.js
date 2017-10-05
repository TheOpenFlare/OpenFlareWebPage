var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var pkg = require('./package.json');
var server = require('gulp-server-livereload');
var sww = require('gulp-sww');
var realFavicon = require('gulp-real-favicon');
var fs = require('fs');

// Set the banner content
var banner = ['/*!\n',
    ' * OpenFlare - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
    ' * Copyright 2017-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
    ' * Licensed under <%= pkg.license %> (https://github.com/poqdavid/<%= pkg.name %>/blob/master/LICENSE)\n',
    ' */\n',
    ''
].join('');

// File where the favicon markups are stored
var FAVICON_DATA_FILE = 'faviconData.json';

// Generate the icons. This task takes a few seconds to complete.
// You should run it at least once to create the icons. Then,
// you should run it whenever RealFaviconGenerator updates its
// package (see the check-for-favicon-update task below).
gulp.task('generate-favicon', function (done) {
    realFavicon.generateFavicon({
        masterPicture: 'src/img/OpenFlare700.png',
        dest: 'src/',
        iconsPath: '/',
        design: {
            ios: {
                pictureAspect: 'backgroundAndMargin',
                backgroundColor: '#ffffff',
                margin: '0%',
                assets: {
                    ios6AndPriorIcons: true,
                    ios7AndLaterIcons: true,
                    precomposedIcons: true,
                    declareOnlyDefaultIcon: true
                },
                appName: 'OpenFlare'
            },
            desktopBrowser: {},
            windows: {
                pictureAspect: 'noChange',
                backgroundColor: '#00aba9',
                onConflict: 'override',
                assets: {
                    windows80Ie10Tile: true,
                    windows10Ie11EdgeTiles: {
                        small: true,
                        medium: true,
                        big: true,
                        rectangle: true
                    }
                },
                appName: 'OpenFlare'
            },
            androidChrome: {
                pictureAspect: 'noChange',
                themeColor: '#ffffff',
                manifest: {
                    name: 'OpenFlare',
                    display: 'standalone',
                    orientation: 'notSet',
                    onConflict: 'override',
                    declared: true
                },
                assets: {
                    legacyIcon: true,
                    lowResolutionIcons: true
                }
            },
            safariPinnedTab: {
                pictureAspect: 'silhouette',
                themeColor: '#5bbad5'
            }
        },
        settings: {
            scalingAlgorithm: 'Mitchell',
            errorOnImageTooSmall: false
        },
        markupFile: FAVICON_DATA_FILE
    }, function () {
        done();
    });
});

// Inject the favicon markups in your HTML pages. You should run
// this task whenever you modify a page. You can keep this task
// as is or refactor your existing HTML pipeline.
gulp.task('inject-favicon-markups', function () {
    return gulp.src(['src/index.html'])
        .pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
        .pipe(gulp.dest('src'));
});

// Check for updates on RealFaviconGenerator (think: Apple has just
// released a new Touch icon along with the latest version of iOS).
// Run this task from time to time. Ideally, make it part of your
// continuous integration system.
gulp.task('check-for-favicon-update', function (done) {
    var currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
    realFavicon.checkForUpdates(currentVersion, function (err) {
        if (err) {
            throw err;
        }
    });
});

// Compiles SCSS files from /scss into /css
gulp.task('sass', function () {
    return gulp.src('src/scss/main.scss')
        .pipe(sass())
        .pipe(header(banner, {
            pkg: pkg
        }))
        .pipe(gulp.dest('src/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Minify compiled CSS
gulp.task('minify-css', ['sass'], function () {
    return gulp.src('src/css/main.css')
        .pipe(cleanCSS({
            compatibility: 'ie8'
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('src/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Minify custom JS
gulp.task('minify-js', function () {
    return gulp.src('src/js/main.js')
        .pipe(uglify())
        .pipe(header(banner, {
            pkg: pkg
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('src/js'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Copy vendor files from /node_modules into /vendor
// NOTE: requires `npm install` before running!
gulp.task('copy', function () {
    gulp.src([
        'node_modules/bootstrap/dist/**/*',
        '!**/npm.js',
        '!**/bootstrap-theme.*',
        '!**/*.map'
    ])
        .pipe(gulp.dest('src/vendor/bootstrap'))
        .pipe(browserSync.stream());

    gulp.src(['node_modules/jquery/dist/jquery.js', 'node_modules/jquery/dist/jquery.min.js'])
        .pipe(gulp.dest('src/vendor/jquery'))
        .pipe(browserSync.stream());

    gulp.src(['node_modules/popper.js/dist/umd/popper.js', 'node_modules/popper.js/dist/umd/popper.min.js'])
        .pipe(gulp.dest('src/vendor/popper'))
        .pipe(browserSync.stream());

    gulp.src(['node_modules/jquery.easing/*.js'])
        .pipe(gulp.dest('src/vendor/jquery-easing'))
        .pipe(browserSync.stream());

    gulp.src(['node_modules/simple-line-icons/*/*'])
        .pipe(gulp.dest('src/vendor/simple-line-icons'))
        .pipe(browserSync.stream());


    gulp.src([
        'node_modules/font-awesome/**',
        '!node_modules/font-awesome/**/*.map',
        '!node_modules/font-awesome/.npmignore',
        '!node_modules/font-awesome/*.txt',
        '!node_modules/font-awesome/*.md',
        '!node_modules/font-awesome/*.json'
    ])
        .pipe(gulp.dest('src/vendor/font-awesome'))
        .pipe(browserSync.stream());
})

gulp.task('offline', function () {
    return gulp.src([
        '**/*',
        '!gulpfile.js',
        '!package.json'
    ], { cwd: './src/' })
        .pipe(sww({ 'version': 1 }))
        .pipe(gulp.dest('./src/'));
});

// Configure the browserSync task
gulp.task('browserSync', function () {

    browserSync.init({
        server: "./src",
        notify: false,
        port: process.env.PORT || 5000
    });
})

gulp.task('dev', ['copy', 'sass', 'minify-css', 'minify-js', 'browserSync'], function () {
    gulp.watch('src/scss/*.scss', ['sass']);
    gulp.watch('src/css/*.css', ['minify-css']);
    gulp.watch('src/js/*.js', ['minify-js']);
    // Reloads the browser whenever HTML or JS files change
    gulp.watch('src/*.html', browserSync.reload);
    gulp.watch('src/js/**/*.js', browserSync.reload);
});

gulp.task('webserver5000', ['copy', 'sass', 'minify-css', 'minify-js'], function () {
    gulp.src('./src/')
        .pipe(server({
            host: '0.0.0.0',
            port: process.env.PORT || 5000,
            livereload: false,
            https: false,
            open: true
        }));

    //gulp.watch('src/scss/*.scss', ['sass']);
    //gulp.watch('src/css/*.css', ['minify-css']);
    //gulp.watch('src/js/*.js', ['minify-js']);
    // Reloads the browser whenever HTML or JS files change
    //gulp.watch('src/*.html', server.reload);
    //gulp.watch('src/js/**/*.js', server.reload);
});

gulp.task('webserver80', ['copy', 'sass', 'minify-css', 'minify-js'], function () {
    gulp.src('./src/')
        .pipe(server({
            host: 'localhost',
            port: 80,
            livereload: false,
            https: false,
            open: true
        }));

    //gulp.watch('src/scss/*.scss', ['sass']);
    //gulp.watch('src/css/*.css', ['minify-css']);
    //gulp.watch('src/js/*.js', ['minify-js']);
    // Reloads the browser whenever HTML or JS files change
    //gulp.watch('src/*.html', server.reload);
    //gulp.watch('src/js/**/*.js', server.reload);
});