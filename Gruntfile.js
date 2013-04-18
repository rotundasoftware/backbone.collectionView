module.exports = function(grunt) {

  grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),
	banner: '/*!\n' +
		'* Backbone.CollectionView, v<%= pkg.version %>\n' +
		'* Copyright (c)2013 Rotunda Software, LLC.\n' +
		'* Distributed under MIT license\n' +
		'* http://github.com/rotundasoftware/backbone-collection-view\n' +
		'*/\n\n',

	// Task configuration.
	concat: {
		options: {
			banner: '<%= banner %>',
			stripBanners: true
		},
		js: {
			src: ['src/<%= pkg.name %>.js'],
			dest: 'dist/<%= pkg.name %>.js'
		},
		css: {
			src: ['css/<%= pkg.name %>.css'],
			dest: 'dist/<%= pkg.name %>.css'
		}
	},
	uglify: {
		options: {
			banner: '<%= banner %>'
		},
		dist: {
			src: '<%= concat.js.dest %>',
			dest: 'dist/<%= pkg.name %>.min.js'
		}
	},
	compress: {
		dist: {
			options: {
				archive: 'zips/Backbone.CollectionView.zip'
			},
			expand: true,
			cwd: 'dist/',
			src: ['**/*'],
			dest: './'
		}
	},
	jshint: {
		options: {
			curly: true,
			eqeqeq: true,
			immed: true,
			latedef: true,
			newcap: true,
			noarg: true,
			sub: true,
			undef: true,
			unused: true,
			boss: true,
			eqnull: true,
			browser: true,
			globals: {
				jQuery: true
			}
		},
		library: {
			src: 'collectionView.js'
		}
	}
});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-compress');

	grunt.registerTask('default', ['concat', 'uglify', 'compress']);

};
