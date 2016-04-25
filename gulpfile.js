var gulp = require('gulp');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var env = require('gulp-env');
var mocha = require('gulp-mocha');
var runSequence = require('run-sequence');
var rimraf = require('rimraf');
var yargs = require('yargs');
var nodemon = require('gulp-nodemon');
var istanbul = require('gulp-istanbul');

gulp.task('clean', function (done) {
    rimraf('./dist', function () {
        done();
    });
});

gulp.task('copy', function () {
    return gulp.src('app/samples-yml/**/*.yml')
        .pipe(gulp.dest('dist'));
});

gulp.task('babel', function () {
    return gulp.src(['app/**/*.js'])
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist'));
});

gulp.task('istanbul', ['default'], function () {
    return gulp.src(['dist/**/*.js', '!dist/test/**/*.js'])
        .pipe(istanbul())
        .pipe(istanbul.hookRequire());
});

gulp.task('test', ['istanbul'], function () {
    process.env.NODE_ENV = 'test';
    process.env.LOG_LEVEL = 'fatal';

    var result = gulp.src('dist/test/**/*.js', {read: false})
        .pipe(mocha({
            reporter: 'progress',
            grep: yargs.argv.grep,
            require: ["babel-polyfill", "source-map-support/register"]
        }));

    if (yargs.argv.coverage) {
        result = result.pipe(istanbul.writeReports())
    }

    return result;
});

gulp.task('serve', ['default'], function () {
    nodemon({
        script: "dist/app.js",
        watch: ['app'],
        ext: 'js',
        env: {'NODE_ENV': 'development', 'BLUEBIRD_WARNINGS': 0},
        tasks: ['babel']
    });
});

gulp.task('default', function (done) {
    runSequence('clean', 'copy', 'babel', done);
});