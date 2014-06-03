var should = require('should'),
	lib = require('../lib.js'),
	fs = require('fs-extra'),
	path = require('path'),
	testutil = require("testutil"),
	async = require('async'),	
	_ = require('lodash');
	
var TEST_DIR = '',
	TEST_FILES = ['test a.test', 'test b.test'];

describe('auto-file-to-dir', function() {
	before(function(done) {
		TEST_DIR = testutil.createTestDir("move-test");
		done();
	});
	
	after(function(done) {
		// fs.remove(TEST_DIR, done);
		done();
	});

	describe(' - text and numbering with no brackets', function() {
		it('no file to be moved', function(done){
			var options = ['node', 'auto-file-to-dir', TEST_DIR];

			//prepare test files
			_.each(TEST_FILES, function(file){
				fs.outputFileSync(path.resolve(TEST_DIR, file), file);
			});

			//test
			lib.fileToDir(function(){
				fs.readdir(TEST_DIR, function(err, resultFiles){
					if(err !== null){
						should(false);
						done();
						return;
					}
					var diff = _.difference(TEST_FILES, resultFiles);
					should(diff.length === 0);
				
					done();
				});
			});
		});
	});
});