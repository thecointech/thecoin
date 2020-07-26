"use strict"

var stdin = process.stdin,
  stdout = process.stdout,
  inputChunks = [];

stdin.resume();
stdin.setEncoding('utf8');

stdin.on('data', function (chunk) {
  inputChunks.push(chunk);
});

stdin.on('end', function () {

  var content = inputChunks.join("");
  // First, we clean up any globs (repathing can break them)
  content = content.replace(/build\/\*\*\/\*/g, "**/*");
  // we are copying into the build folder, so
  // update the paths in the package.json
  content = content.replace(/(\.\/)?build\//g, "./");

  stdout.write(content);
});
