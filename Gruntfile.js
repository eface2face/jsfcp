/*global module:false*/


module.exports = function(grunt) {
	// Banner.
	var banner = require('fs').readFileSync('banner.txt').toString();

	// Generated build.
	var build = {
		dist: 'build/<%= pkg.name %>-<%= pkg.version %>.js',
		last: 'build/<%= pkg.name %>-last.js',
	};

	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		jshint: {
			// Default options.
			options: {
				// DOC: http://www.jshint.com/docs/options/
				curly: true,
				eqeqeq: true,
				immed: true,
				latedef: 'nofunc',  // Allow functions to be used before defined (it is valid).
				newcap: true,
				noarg: true,
				noempty: true,
				nonbsp:  true,
				nonew: true,
				plusplus: false,
				undef: true,
				unused: 'strict',
				boss: false,
				eqnull: false,
				funcscope: false,
				sub: false,
				supernew: false,
				browser: true,
				node: true,
				nonstandard: true,  // Allow 'unescape()' and 'escape()'.
				globals: {}
			},
			// Lint JS files separately.
			each_file: {
				src: [ 'lib/**/*.js' ]
			}
		},

		browserify: {
			dist: {
				files: {
					'build/<%= pkg.name %>-<%= pkg.version %>.js': [ 'lib/JsFCP.js' ]
				},
				options: {
					browserifyOptions: {
						standalone: 'JsFCP'
					}
				}
			}
		},

		concat: {
			dist: {
				src: build.dist,
				dest: build.dist,
				options: {
					banner: banner,
					separator: '\n\n'
				},
				nonull: true
			}
		},

		qunit: {
			files: [ 'test/*.html' ]
		},

		uglify: {
			dist: {
				files: {
					'build/<%= pkg.name %>-<%= pkg.version %>.min.js': [ build.dist ]
				}
			},
			options: {
				banner: banner
			}
		},

		watch: {
			dist: {
				files: [ 'lib/**/*.js' ],
				tasks: [ 'dist' ],
				options: {
					nospawn: true
				}
			}
		},

		symlink: {
			options: {
				overwrite: true
			},
			last: {
				src: build.dist,
				dest: build.last
			}
		}
	});


	// Load Grunt plugins.
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-symlink');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-qunit');


	// Taks for building build/jsfcp-X.Y.Z.js, build/jsfcp-last.js symlink and build/jsfcp-X.Y.Z.min.js.
	grunt.registerTask('dist', [ 'jshint:each_file', 'browserify:dist', 'concat:dist', 'symlink:last', 'uglify:dist' ]);

	// Test task.
	grunt.registerTask('test', [ 'qunit' ]);

	// Default task is an alias for 'dist'.
	grunt.registerTask('default', [ 'dist' ]);
};
