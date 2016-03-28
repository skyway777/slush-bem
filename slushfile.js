/*
 * slush-bem
 * https://github.com/Nikita/slush-bem
 *
 * Copyright (c) 2016, Nikita
 * Licensed under the MIT license.
 */

'use strict';

var gulp = require('gulp'),
    install = require('gulp-install'),
    conflict = require('gulp-conflict'),
    template = require('gulp-template'),
    rename = require('gulp-rename'),
    _ = require('underscore.string'),
    inquirer = require('inquirer'),
    path = require('path'),
    insert = require('gulp-insert');

function format(string) {
    var username = string.toLowerCase();
    return username.replace(/\s/g, '');
}



gulp.task('default', function (done) {
    var prompts = [
      {
        type: 'list',
        name: 'element',
        message: 'Choose your element type:',
        choices: ['block', 'elems'],
        default: 'block'
      }
    ];
    //Ask
    inquirer.prompt(prompts,
      function (answers) {
        run_gulp(answers.element);
      }
    );
});

gulp.task('block',function(done){
    run_gulp('block');
});

gulp.task('elem',function(done){
    run_gulp('elem');
});

gulp.task('mod',function(done){
    run_gulp('mod');
});

function run_gulp(param) {
  var defaults = (function () {
    var workingDirName = path.basename(process.cwd()),
      homeDir, osUserName, configFile, user;

    if (process.platform === 'win32') {
        homeDir = process.env.USERPROFILE;
        osUserName = process.env.USERNAME || path.basename(homeDir).toLowerCase();
    }
    else {
        homeDir = process.env.HOME || process.env.HOMEPATH;
        osUserName = homeDir && homeDir.split('/').pop() || 'root';
    }

    configFile = path.join(homeDir, '.gitconfig');
    user = {};

    if (require('fs').existsSync(configFile)) {
        user = require('iniparser').parseSync(configFile).user;
    }
    
    var result = {
        appName: workingDirName,
        userName: osUserName || format(user.name || ''),
        authorName: user.name || '',
        authorEmail: user.email || '',
        folder:'common.blocks',
        elemSplitter:'__',
        modSplitter:'_',
        blockName:'',
        modName:'',
        modValue:'',
        elemName:'',
        elemModName:'',
        elemModValue:''
    };
          
    if (gulp.args[0])
        {
            var elemBlock = gulp.args[0].split(result.elemSplitter);
            result.blockName = elemBlock[0];
            var blockMod = result.blockName.split(result.modSplitter);
            if (blockMod.length > 1)
                {
                    result.blockName = blockMod[0];
                    result.modName = blockMod[1];
                }
            if (blockMod.length > 2)
                {
                    result.modValue = blockMod[2];
                }
            
            if (elemBlock.length >1)
            {
                
                result.elemName = elemBlock[1];                
                var elemMod = result.elemName.split(result.modSplitter);
                result.elemName = elemMod[0];
            
            if (elemMod.length > 1)
                {
                    result.elemName = elemMod[0];
                    result.elemModName = elemMod[1];
                }
            if (elemMod.length > 2)
                {
                    result.elemModValue = elemMod[2];
                }
            }
        }
    
      
    return result;
})();

var prompts = [
    {
        name:'folder',
        message:'Enter folder (common.blocks):',
        default:defaults.folder
    },
      {
        name: 'blockName',
        message: 'Enter block name:',
        default:defaults.blockName
      }
    ];
    
  if (param == "block") 
  {
    //Ask
    var exec = function (answers) {
        gulp.src(__dirname + '/templates/block/*')
          .pipe(rename(function (file) {
            file.basename = answers.blockName
          }))
          .pipe(template(answers))
          .pipe(conflict('./'+defaults.folder+'/'+answers.blockName))
          .pipe(gulp.dest('./'+defaults.folder+'/'+answers.blockName));
    };

    if (gulp.args[0])
    {
      exec(defaults);
      return;
    }
    //Ask
    inquirer.prompt(prompts,exec);
  }
  else if (param == "elem"){
    prompts.push({
        name:'elemName',
        message:'Enter name of Element',
        default:defaults.elemName
    });

    var exec = function (answers) {
        answers.elemSplitter = "__";
        gulp.src(__dirname + '/templates/elem/*')
          .pipe((function(){return template(answers);})())
          .pipe(rename(function (file) {
            file.basename = answers.blockName+answers.elemSplitter+answers.elemName;
          }))
          .pipe(conflict('./'+defaults.folder+'/'+answers.blockName+'/'+answers.elemSplitter+answers.elemName))
          .pipe(gulp.dest('./'+defaults.folder+'/'+answers.blockName+'/'+answers.elemSplitter+answers.elemName));
    };

    if (gulp.args[0])
    {
      exec(defaults);
      return;
    }
    //Ask
    inquirer.prompt(prompts,
      exec);
    }
    else if (param == "mod"){
        prompts.push({
            name:'modName',
            message:'Enter name of Block Modifier',
            default:defaults.modName
        });
        
        prompts.push({
            name:'modValue',
            message:'Enter value of Block Modifier',
            default:defaults.modValue
        });
        
        prompts.push({
            name:'elemModName',
            message:'Enter name of Elem Modifier',
            default:defaults.elemModName
        });
        
        prompts.push({
            name:'elemModValue',
            message:'Enter value of Elem Modifier',
            default:defaults.elemModValue
        });
        
        var exec = function (answers) {
            var dirName='';
            if (answers.modName && answers.elemModName){
                dirName='/templates/modElemMod'
            }
            else if (answers.modName){
                dirName='/templates/mod'
            }
            else if (answers.elemModName){
                dirName='/templates/elemMod'
            }
            
            var path = './'+defaults.folder + '/' + answers.blockName;
            var filename = answers.blockName;
            
            if (answers.modName != '')
            {
                path += '/'+defaults.modSplitter+answers.modName;
                filename +=defaults.modSplitter+answers.modName;
            }
            
            if (answers.modValue != '')
            {
                path += '/'+defaults.modSplitter+answers.modValue;
                filename +=defaults.modSplitter+answers.modValue;
            }
            
            if (answers.elemName != '')
                {
                    path += '/'+defaults.elemSplitter+answers.elemName;
                    filename +=defaults.elemSplitter+answers.elemName;
                }
            
            if (answers.elemModName != '')
            {
                path += '/'+defaults.modSplitter+answers.elemModName;
                filename +=defaults.modSplitter+answers.elemModName;
            }
            
            if (answers.elemModValue)
            {
                path += '/'+defaults.modSplitter+answers.elemModValue;
                filename +=defaults.modSplitter+answers.elemModValue;
            }
            
            
            gulp.src(__dirname + dirName+'/*')
              .pipe((function(){return template(answers);})())
              .pipe(rename(function (file) {
                file.basename = filename;
              }))
              .pipe(conflict(path))
              .pipe(gulp.dest(path));
        };

        if (gulp.args[0])
        {
          exec(defaults);
          return;
        }
        
        inquirer.prompt(prompts,
            exec);
    }
}