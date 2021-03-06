var es = require('event-stream');
var os = require('os');
var path = require('path');
var gutil = require('gulp-util');

module.exports = function(fileName, opt){
  if (!fileName) throw new Error("Missing fileName option for gulp-concat");
  if (!opt) opt = {};
  if (!opt.newLine) opt.newLine = gutil.linefeed;
  
  var buffer = [];
  var firstFile = null;

  function bufferContents(file){
    if (file.isNull()) return; // ignore
    if (file.isStream()) return cb(new Error("gulp-concat: Streaming not supported"));

    if (!firstFile) firstFile = file;

    buffer.push(file.contents.toString('utf8'));
  }

  function endStream(){
    if (buffer.length === 0) return this.emit('end');

    var joinedContents = buffer.join(opt.newLine);

    var joinedPath = path.join(firstFile.base, fileName);

    var joinedFile = new gutil.File({
      cwd: firstFile.cwd,
      base: firstFile.base,
      path: joinedPath,
      contents: new Buffer(joinedContents)
    });

    this.emit('data', joinedFile);
    this.emit('end');
  }

  return es.through(bufferContents, endStream);
};
