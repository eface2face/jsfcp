/*global module:false*/


module.exports = function(grunt) {
	// Banner.
	var banner = require('fs').readFileSync('banner.txt').toString();

	// Generated bundles.
	var dist = {
		uncompressed: 'dist/<%= pkg.name %>-<%= pkg.version %>.js',
		last: 'dist/<%= pkg.name %>-last.js',
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

		nodeunit: {
			all: [ 'test/*.js' ],
			options: {
				reporter: 'default'
			}
		},

		browserify: {
			uncompressed: {
				files: {
					'dist/<%= pkg.name %>-<%= pkg.version %>.js': [ 'lib/JsFCP.js' ]
				},
				options: {
					browserifyOptions: {
						standalone: 'JsFCP'
					}
				}
			}
		},

		concat: {
			uncompressed: {
				src: dist.uncompressed,
				dest: dist.uncompressed,
				options: {
					banner: banner,
					separator: '\n\n'
				},
				nonull: true
			}
		},

		symlink: {
			options: {
				overwrite: true
			},
			last: {
				src: dist.uncompressed,
				dest: dist.last
			}
		},

		uglify: {
			uncompressed: {
				files: {
					'dist/<%= pkg.name %>-<%= pkg.version %>.min.js': [ dist.uncompressed ]
				}
			},
			options: {
				banner: banner
			}
		},

		watch: {
			all: {
				files: [ 'lib/**/*.js' ],
				tasks: [ 'test' ],
				options: {
					nospawn: true
				}
			}
		}
	});


	// Load Grunt plugins.
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-nodeunit');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-symlink');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-browserify');


	// Taks for building dist/jsfcp-X.Y.Z.js, dist/jsfcp-last.js symlink and dist/jsfcp-X.Y.Z.min.js.
	grunt.registerTask('bundle', [ 'jshint:each_file', 'browserify:uncompressed', 'concat:uncompressed', 'symlink:last', 'uglify:uncompressed' ]);

	// Test task.
	grunt.registerTask('test', [ 'nodeunit:all' ]);

	// Default task is an alias for 'test' and 'bundle'.
	grunt.registerTask('default', [ 'test', 'bundle' ]);
};
