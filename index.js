var fs = require('fs');
var parse = require('csv-parse');
const { exec } = require('child_process');
const TelegramBot = require('node-telegram-bot-api');
const token =  fs.readFileSync('data/token', 'utf8').trim();
var csvData = [];
var baseTime = 0;
var chatid = fs.readFileSync('data/chatid', 'utf8').trim();
var refreshTime = 3000;
const bot = new TelegramBot(token, {polling: true});

function checkEntry(entry) {
  if (entry[4] != "22232") return false;
  return true;
}

function sendEntry(entry) {
  text = "";
  //text += "Start time: " + entry[0];
  text += "\n📞 Durata: " + parseInt(entry[1]) + " s";
  text += "\n⬅️ Provenienza: " + entry[2];
  text += "\n🆔 " + entry[3];
  text += "\n➡️ Destinazione: " + entry[4];
  if (entry[5] != " " && entry[5] != "0.000")
    text += "\n📶 RSSI: " + entry[5] + " dBm";
  text += "\n📡 Sito: " + entry[6];
  if (!entry[7].startsWith("0.0%"))
    text += "\n⚠️ Pacchetti persi: " + entry[7];
  bot.sendMessage(chatid, text);
}

function parseData() {
  //console.log("Downloading data...");
  exec('./parser.sh', (err, stdout, stderr) => {
    if (err) return;

    fs.createReadStream("/tmp/dmrdata/data.csv")
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
          //console.log("Data downloaded.");
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

  setTimeout(function() {parseData()}, refreshTime);
}

parseData();
//bot.sendMessage(chatid, "online");
