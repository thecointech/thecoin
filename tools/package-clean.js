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

  var json = JSON.parse(inputChunks.join(""));
  json.name = json.name.replace("-src", "");
  if (json.main) {
    json.main = json.main.replace("src/", "");
    json.types = json.main.replace(".js", ".d.ts");
  }
  if (json.dependencies)
  {
    Object.keys(json.dependencies).forEach(key => {
      json.dependencies[key] = "*"
    })
  }
  json.files = undefined;
  json.scripts = undefined;
  json.devDependencies = undefined;
  json.directories = undefined;
  stdout.write(JSON.stringify(json, null, 2));
});