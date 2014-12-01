/**
 * Dependencies.
 */
var browserify = require('browserify');
var vinyl_transform = require('vinyl-transform');
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var filelog = require('gulp-filelog');
var header = require('gulp-header');
var nodeunit = require('gulp-nodeunit-runner');
var fs = require('fs');
var pkg = require('./package.json');


// Build filenames.
var builds = {
	uncompressed: pkg.name + '-' + pkg.version + '.js',
	compressed:   pkg.name + '-' + pkg.version + '.min.js',
	last:         pkg.name + '-last.js',
};

// Banner text.
var banner = fs.readFileSync('banner.txt').toString();
var banner_options = {
	pkg: pkg,
	currentYear: (new Date()).getFullYear()
};


gulp.task('lint', function() {
	return gulp.src(['gulpfile.js', 'lib/**/*.js', 'test/**/*.js'])
		.pipe(filelog('lint'))
		.pipe(jshint('.jshintrc'))
		.pipe(jshint.reporter('jshint-stylish', {verbose: true}))
		.pipe(jshint.reporter('fail'));
});


gulp.task('browserify', function() {
	var browserified = vinyl_transform(function(filename) {
		var b = browserify(filename, {standalone: 'JsFCP'});
		return b.bundle();
	});

	return gulp.src(pkg.main)
		.pipe(filelog('browserify'))
		.pipe(browserified)
		.pipe(header(banner, banner_options))
		.pipe(rename(builds.uncompressed))
		.pipe(gulp.dest('dist/'));
});


gulp.task('min', function() {
	return gulp.src('dist/' + builds.uncompressed)
		.pipe(filelog('min'))
		.pipe(uglify())
		.pipe(header(banner, banner_options))
		.pipe(rename(builds.compressed))
		.pipe(gulp.dest('dist/'));
});


gulp.task('test', function() {
	return gulp.src('test/*.js')
		.pipe(filelog('test'))
		.pipe(nodeunit({reporter: 'default'}));
});


gulp.task('dist', gulp.series('lint', 'browserify', 'min'));


gulp.task('default', gulp.series('test', 'dist'));
