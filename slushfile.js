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
})

gulp.task('elem',function(done){
    run_gulp('elem');
})

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

    return {
        appName: workingDirName,
        userName: osUserName || format(user.name || ''),
        authorName: user.name || '',
        authorEmail: user.email || '',
        folder:'common.blocks',
        blockName:gulp.args[0],
        elemName:gulp.args[1]
    };
})();

  if (param == "block") 
  {
    var prompts = [
    {
        name:'folder',
        message:'Enter folder (common.blocks):',
        default:defaults.folder
    },
      {
        name: 'blockName',
        message: 'Enter block name:',
        default:defaults.blockNamel
      }, 
      {
        type: 'confirm',
        name: 'addToCss',
        message: 'Add css file to main.css?'
      }, 
      {
        type: 'confirm',
        name: 'addToJs',
        message: 'Add javascript file to main.js?'
      }
    ];
    //Ask
    inquirer.prompt(prompts,
      function (answers) {
        gulp.src(__dirname + '/templates/block/*')
          
          .pipe(rename(function (file) {
            file.basename = answers.blockName
          }))
          .pipe(template(answers))
          .pipe(conflict('./'+defaults.folder+'/'+answers.blockName))
          .pipe(gulp.dest('./'+defaults.folder+'/'+answers.blockName));
        if (answers.addToCss) {
          gulp.src('./'+defaults.folder+'/main.css')
            .pipe(insert.append('\n@import "../blocks/'+answers.blockName+'/'+answers.blockName+'";'))
            .pipe(gulp.dest('./'+defaults.folder+'/'));
        }
        if (answers.addToJs) {
          gulp.src('./'+defaults.folder+'/main.js')
            .pipe(insert.append('\n//= ../blocks/'+answers.blockName+'/'+answers.blockName+'.js'))
            .pipe(gulp.dest('./'+defaults.folder+'/'));
        }
      }
    );
  }
  else if (param == "elem"){
    var prompts = [
    {
        name:'folder',
        message:'Enter folder :',
        default:defaults.folder
    },
    {
        name:'blockName',
        message:'Enter name of Block',
        default:defaults.blockName
    },
    {
        name:'elemName',
        message:'Enter name of Element',
        default:defaults.elemName
    }];

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

    if (gulp.args[0] && gulp.args[1])
    {
      exec(defaults);
      return;
    }
    //Ask
    inquirer.prompt(prompts,
      exec);
  } 
  else if (param == "page") 
  {
    var prompts = [
      {
        name: 'pageName',
        message: 'Enter page name:',
      }
    ];
    //Ask
    inquirer.prompt(prompts,
      function (answers) {
          //answers.appNameSlug = _.slugify(answers.appName);
          gulp.src(__dirname + '/templates/**')
              .pipe(template(answers))
              .pipe(rename(function (file) {
                  if (file.basename[0] === '_') {
                      file.basename = '.' + file.basename.slice(1);
                  }
              }))
              .pipe(conflict('./'))
              .pipe(gulp.dest('./'))
              .pipe(install())
              .on('end', function () {
                  done();
              });
      }
    );
  }

}