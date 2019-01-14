var fs = require('fs');
var parse = require('csv-parse');
const { exec } = require('child_process');
const TelegramBot = require('node-telegram-bot-api');
const token =  fs.readFileSync('data/token', 'utf8').trim();
var csvData=[];
var baseTime = 0;


function parseData() {
  console.log("Downloading data...");
  exec('./parser.sh', (err, stdout, stderr) => {
    if (err) return; // node couldn't execute the command

    // the *entire* stdout and stderr (buffered)
    // console.log(`stdout: ${stdout}`);
    // console.log(`stderr: ${stderr}`);

    fs.createReadStream("data/data.csv")
        .pipe(parse({delimiter: ','}))
        .on('data', function(csvrow) {
            //console.log(csvrow);
            //do something with csvrow
            csvData.push(csvrow);
        })
        .on('end',function() {
          //do something whit csvData
          //console.log(csvData);
          csvData.reverse();
          console.log("Data downloaded.");
          checkUpdates();
        });
  });
}

function checkUpdates() {
  csvData.forEach(function(entry) {
      entryTime = Date.parse(entry[0]);
      if (entryTime >= baseTime) {
        baseTime = entryTime;
        console.log("NEW ENTRY");
        console.log(entry);
      } else {
        console.log("OLD ENTRY");
      }
  });

  setTimeout(function() {parseData()}, 5000);
}

parseData();
