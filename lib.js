"use scrict";

var program = require('commander'),
	fs = require('fs'),
	path = require('path'),
	readline = require('readline'),
	_ = require('lodash'),
	async = require('async');
	

var workDir = '.';
var pattern = /^(?:\[[^\]]*\])?(.*?)([ \-0-9\uff10\uff11\uff12\uff13\uff14\uff15\uff16\uff17\uff18\uff19]*) ?(?:\[[^\]]*\])?(?:\([^\)]*\))?\..*$/;
var version = '0.0.1';


/* 
	main 
*/
function fileToDir(options, callback){
	
	if(typeof callback !== "function"){
		callback = function(){};
	}
	
	//set args
	program
		.version(version)
		.option("-i, --ask","ask for confirmation before moving files")
		.option("-v, --verbose", "output more information")
		.option("-f, --force", "move files even if directory already exists")
		.option("-n, --dry-run", "simulate processing (no change to files)")
		.option("[directory]", "directory to process");

	program.usage("[options] [directory]");
	
	parseArgs(options);
	
	if(workDir === null) {
		callback();
		return;
	}
	groupedFilesFromPath(workDir, function(fileGroups){
		if(_.isEmpty(fileGroups)){
			if(program.verbose){
				console.log('Nothing to do.');
			}
			callback();
			return;
		}
		async.eachSeries(_.values(fileGroups), moveFilesIntoDir, function(err){
			if(_.isUndefined(err) || err === null){
				if(program.verbose){
					console.log('Task finished.');
				}
			} else {
				console.error('Error ' + err);
			}
			callback();
			return;
		});
	});
}


/* 
	helper functions
*/


/*
	parse args and init global variables as needed
*/
function parseArgs(options){
	
	if(!_.isEmpty(options)){
		program.parse(options);
	} else {
		program.parse(process.argv);
	}
	
	//parse
	var args = program.args;
		
	if(args.length > 0){
		workDir = args[0];
	}
	fs.stat(workDir, function(err, stats){
		if(err !== null && !_.isUndefined(err)){
			//an error occurred
			console.error('Error ' + err.name + ' ' + err.message);
			workdir = null;
			return;
		}
		if(stats.isFile()){
			workDir = path.dirname(workDir);
		}
	});
	
	if(program.verbose){
		console.log('working on dirctory ' + workDir);
	}
	
	return args;
}

/*
	list files to be moved grouped by common name portion
*/
function groupedFilesFromPath(filePath, callback){
	if(typeof(callback) !== "function"){
		callback = function(){};
	}
	fs.readdir(filePath, function(err, files){
		if(err !== null && !_.isUndefined(err)){
			//an error occurred
			console.error('Error ' + err.name + ' ' + err.message);
			callback();
			return;
		}
		var sortedFiles = _.sortBy(files),
			fileGroups = {};
		_.forEach(sortedFiles, function(file){
			var matches = pattern.exec(file),
				match;
			if(matches === null || matches.length < 2 || _.isEmpty(matches[1])){
				if(program.verbose){
					console.log('skip file %s (not matching pattern)', file);
				}
				return;
			}
			match = matches[1].trim();
			// match = cleanPattern.exec(match)[1];
			// console.log("Match " + match + " -> charcode " + match.charCodeAt(match.length-1).toString(16));
			if(_.isEmpty(fileGroups[match])){
				fileGroups[match] = {directory: match, files: []};
			}
			fileGroups[match].files.push(file); 
		});
		
		callback(fileGroups);
	});
}

/*
	move files according to their grouping
*/
function moveFilesIntoDir(group, callback){
	if(typeof(callback) !== "function"){
		callback = function(){};
	}
	if(_.isEmpty(group.files) || group.files.length === 1){
		if(program.verbose){
			console.log('skip directory %s: single file or no files to move', group.directory);
		}
		callback();
		return;
	}
	var targetDir = path.join(workDir, group.directory);

	var prepareDirectory = function(nextOperation, doneCallback){
		if(program.verbose){
			console.log('Use directory ' + targetDir);
		}
		if(program.dryRun){
			nextOperation(doneCallback);
			return;
		}
		fs.mkdir(targetDir, function(err){
			if(err !== null && !_.isUndefined(err)){
				console.error('Could not create directory. Error ' + err.name + ' ' + err.message);
				if(!program.force){
					console.error('Use --force option to use the existing directory anyway');
					doneCallback();
					return;
				}
			}
			nextOperation(doneCallback);
		});	
	};
	var moveFiles = function(doneCallback){
		async.each(group.files, function(file, fileCallback) {
			var from = path.join(workDir,file),
				to = path.join(targetDir,file);
			
			if(program.verbose){
				console.log('Move ' + from + ' to ' + to);
			}
			if(program.dryRun) {
				fileCallback();
				return;
			}
			
			fs.rename(from, to, function(err){
				
				if(err !== null && !_.isUndefined(err)){
					console.error('Could not move file ' + file + '. Error ' + err.name + ' ' + err.message);
				}
				fileCallback();
			});
		}, function(err){
			//ignore error (nothing to do)
			doneCallback();
		});
	};
		
	if(!program.ask){
		prepareDirectory(moveFiles, callback);
	} else {
		var cli = readline.createInterface(process.stdin, process.stdout);
	
		cli.write('Move files:\n');
		_.forEach(group.files, function(file){
			cli.write(file + '\n');
		});
		cli.question('to directory ' + group.directory + '? [Y/n]\n', function(response){
			if(response !== 'n' && response !== 'no'){
				prepareDirectory(moveFiles, function(){
					cli.close();
					callback();
				});
			}
		});
	}
}

exports.fileToDir = fileToDir;