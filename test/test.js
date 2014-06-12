var should = require('should'),
	lib = require('../lib.js'),
	fs = require('fs-extra'),
	path = require('path'),
	testutil = require("testutil"),
	async = require('async'),	
	_ = require('lodash');
	
var TEST_DIR = '';

function prepareTestFiles(testFiles){
	_.each(testFiles, function(file){
		fs.outputFileSync(path.resolve(TEST_DIR, file), file);
	});
}

function executeTest(testFiles, expectedDir, commandOptions, done){
	//prepare test files
	prepareTestFiles(testFiles);

	//test
	lib.fileToDir(commandOptions, function(){
			testResult(testFiles, expectedDir, done);
	});
}

function testResult(testFiles, expectedDirectory, done){
	fs.readdir(expectedDirectory, function(err, resultFiles){
		if(err !== null){
			done(err);
			return;
		}
		var diff = _.difference(testFiles, resultFiles);
		should(resultFiles.length > 0 && diff.length === 0);
		done();
	});
}



describe('auto-file-to-dir', function() {
	beforeEach(function(done) {
		TEST_DIR = testutil.createTestDir("move-test");
		done();
		// fs.readdir(TEST_DIR, function(err, resultFiles){
// 			console.log('before directory:');
// 			console.log(resultFiles);
// 			done();
// 		});
	});
	
	afterEach(function(done) {
		// console.log('after');
		fs.remove(TEST_DIR, done);
		
		// fs.readdir(TEST_DIR, function(err, resultFiles){
		// 	console.log('resulting directory:');
		// 	console.log(resultFiles);
		// });
	});

	////////////////// TESTS

	it(' - minimum pattern', function(done){
		executeTest(
			['test 01.test', 'test 02.test'],
			path.resolve(TEST_DIR, 'test'),
			['node', 'auto-file-to-dir', TEST_DIR],
			done
		);
	});
	

	it('- numbers only', function(done){
		executeTest(
			['01.test', '02.test'],
			TEST_DIR,
			['node', 'auto-file-to-dir', TEST_DIR],
			done
		);
	});
	
	it('-  no numbers', function(done){
		executeTest(
			['test a.test', 'test b.test'],
			TEST_DIR,
			['node', 'auto-file-to-dir', TEST_DIR],
			done
		);
	});
	
	it('-  no spaces', function(done){
		executeTest(
			['test01.test', 'test02.test'],
			TEST_DIR,
			['node', 'auto-file-to-dir', TEST_DIR],
			done
		);
	});
	
	it('-  brackets before', function(done){
		executeTest(
			['[aaa] test 01.test', '[bbb] test 02.test'],
			path.resolve(TEST_DIR, 'test'),
			['node', 'auto-file-to-dir', TEST_DIR],
			done
		);
	});
	
	it('-  brackets after', function(done){
		executeTest(
			['test 01 [aaa].test', 'test 02 [bbb].test'],
			path.resolve(TEST_DIR, 'test'),
			['node', 'auto-file-to-dir', TEST_DIR],
			done
		);
	});
	
	it('-  multiple number groups', function(done){
		executeTest(
			['test 01 02.test', 'test 01 03.test'],
			path.resolve(TEST_DIR, 'test'),
			['node', 'auto-file-to-dir', TEST_DIR],
			done
		);
	});
});