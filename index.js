var fs = require('fs');
var parse = require('csv-parse');
const { exec } = require('child_process');
const TelegramBot = require('node-telegram-bot-api');
const token =  fs.readFileSync('data/token', 'utf8').trim();
var csvData=[];
var baseTime = 0;
var channelid = "-1001208288459"
const bot = new TelegramBot(token, {polling: true});

function checkEntry(entry) {
  return true;
}

function sendEntry(entry) {
  text = "";
  //text += "Start time: " + entry[0];
  text += "\n📞 Durata: " + parseInt(entry[1]) + " s";
  text += "\nProvenienza: " + entry[2];
  text += "\n🆔 " + entry[3];
  text += "\nDestinazione: " + entry[4];
  if (entry[5] != " " && entry[5] != "0.000")
    text += "\n📶 RSSI (dBm): " + entry[5];
  text += "\nsite name: " + entry[6];
  if (entry[7] != "0.0%")
    text += "\n⚠️ Pacchetti persi: " + entry[7];
  bot.sendMessage(channelid, text);
}

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
          if (baseTime == 0)
            baseTime = Date.parse(csvData[0][0]);
          csvData.reverse();
          console.log("Data downloaded.");
          checkUpdates();
        });
  });
}

function checkUpdates() {
  csvData.forEach(function(entry) {
      entryTime = Date.parse(entry[0]);
      if (entryTime > baseTime) {
        baseTime = entryTime;
        console.log("NEW ENTRY");
        console.log(entry);
        if (checkEntry(entry)) {
          sendEntry(entry);
        }
      } else {
        //console.log("OLD ENTRY");
      }
  });

  setTimeout(function() {parseData()}, 5000);
}

parseData();
bot.sendMessage(channelid, "online");
