var browserify = require('browserify');
var vinyl_source_stream = require('vinyl-source-stream');
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var header = require('gulp-header');
var nodeunit = require('gulp-nodeunit-runner');
var fs = require('fs');
var path = require('path');

const PKG = require('./package.json');
const BANNER = fs.readFileSync('banner.txt').toString();
const BANNER_OPTIONS = {
	pkg: PKG,
	currentYear: (new Date()).getFullYear()
};


gulp.task('lint', function() {
	return gulp.src(['gulpfile.js', 'lib/**/*.js', 'test/**/*.js'])
		.pipe(jshint('.jshintrc'))
		.pipe(jshint.reporter('jshint-stylish', {verbose: true}))
		.pipe(jshint.reporter('fail'));
});


gulp.task('browserify', function() {
	return browserify([path.join(__dirname, PKG.main)], {
		standalone: PKG.title
	}).bundle()
		.pipe(vinyl_source_stream(PKG.name + '.js'))
		.pipe(header(BANNER, BANNER_OPTIONS))
		.pipe(gulp.dest('dist/'));
});


gulp.task('test', function() {
	return gulp.src('test/*.js')
		.pipe(nodeunit({reporter: 'default'}));
});


gulp.task('default', gulp.series('lint', 'test', 'browserify'));
