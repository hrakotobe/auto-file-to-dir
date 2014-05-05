#!/usr/bin/env node


var program = require('commander'),
	fs = require('fs'),
	path = require('path'),
	readline = require('readline'),
	_ = require('lodash'),
	async = require('async');
	

var workDir = '.';
var pattern = /^(?:\[[^\]]*\])?(.*[^0-9\uff10\uff11\uff12\uff13\uff14\uff15\uff16\uff17\uff18\uff19])(?:[0-9\uff10\uff11\uff12\uff13\uff14\uff15\uff16\uff17\uff18\uff19]+)(?: *RAW)(?: *\([^)]*\) *)\.[\w\-]*$/;
var cleanPattern = / *(.*[^\s-])/;
//var pattern = /^([^0-9\uff10\uff11\uff12\uff13\uff14\uff15\uff16\uff17\uff18\uff19]*)*/;
var version = '0.0.1';


/* main operation */

//set args
program
	.version(version)
	.option("-i, --ask","don't ask for confirmation before moving files")
	.option("-v, --verbose", "output more information")
	.option("-f, --force", "move files even if directory already exists")
	.option("-n, --dry-run", "simulate processing")
	.option("[directory]", "directory to process");

main();


/* functions */
function main(){
	
	parseArgs();
		
	groupedFilesFromPath(workDir, function(fileGroups){
		if(_.isEmpty(fileGroups)){
			console.log('nothing to do');
			return;
		}
		async.eachSeries(_.values(fileGroups), moveFilesIntoDir, function(err){
			if(_.isUndefined(err) || err === null){
				console.log('finished');
			} else {
				console.error('error ' + err);
			}
		});
	});
}

function parseArgs(){
	program.parse(process.argv);
	
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

function groupedFilesFromPath(filePath, callback){
	fs.readdir(filePath, function(err, files){
		if(err !== null && !_.isUndefined(err)){
			//an error occurred
			console.error('Error ' + err.name + ' ' + err.message);
			return;
		}
		var sortedFiles = _.sortBy(files),
			fileGroups = {};
		_.forEach(sortedFiles, function(file){
			var matches = pattern.exec(file),
				match;
			if(matches === null){
				if(program.verbose){
					console.log('skip file %s (not matching pattern)', file);
				}
				return;
			}
			match = matches[1];
			match = cleanPattern.exec(match)[1];
			// console.log("Match " + match + " -> charcode " + match.charCodeAt(match.length-1).toString(16));
			if(_.isEmpty(fileGroups[match])){
				fileGroups[match] = {directory: match, files: []};
			}
			fileGroups[match].files.push(file); 
		});
		
		if(typeof(callback) === "function"){
			callback(fileGroups);
		}
	});
}

function moveFilesIntoDir(group, callback){
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