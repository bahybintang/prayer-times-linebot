var schedule = require('node-schedule')
var prayer = require('./PrayerTimes')
var app = require('express')()
var line = require('@line/bot-sdk')

var prayerTimes = prayer.getTimes(new Date(), [-7.797068, 110.370529, 113], 7, 0, "24h")

const config = {
    channelAccessToken: 'QPpBgdobbUDWp/UbPt4ejatkYIqKnBkSl4o1ZMTuxhsCI/Y9o8KE/LrRqTwl33m4hh/oaVbN1JJaQWeDtbkCUe6+AdOgQiPh6B9JiY8B742vlwyKGiwdTvw645gqBb3JVHh0YipcMT9AMmiG65Ia8gdB04t89/1O/w1cDnyilFU=',
    channelSecret: '8bce73487a599e8b2852357e49d803e3'
}

schedule.scheduleJob("1 0 * * *", () => {
    prayerTimes = prayer.getTimes(new Date(), [-7.797068, 110.370529, 113], 7, 0, "24h")
})

const client = new line.Client(config);

app.set('port', (process.env.PORT || 5000))

app.listen(app.get('port'), () => {
    console.log(`Connected to port ${app.get('port')}!`)
})

app.post('/', line.middleware(config), (req, res) => {
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result));
})

function handleEvent (event) {
    console.log("event handled")
    const message = event.message

    if(event.type === "message" && message.type === "text"){
        console.log("text event")
        if(message.text === "start") {
            console.log("start")
            return client.replyMessage(event.replyToken, {
                type : "text",
                text : "Inisialisasi berhasil! \dbc0\dc7a"
            })
        }
        else if(message.text === "waktu sholat"){
            var utc = new Date().toJSON().slice(0,10).replace(/-/g,'/');
            return client.replyMessage(event.replyToken, {
                type : "text",
                text : `\dbc0\dca8 Waktu sholat untuk ${utc} \dbc0\dca8 
                Subuh   : ${prayerTimes.fajr}
                Dhuhur  : ${prayerTimes.dhuhr}
                Ashar   : ${prayerTimes.asr}
                Maghrib : ${prayerTimes.maghrib}
                Isya    : ${prayerTimes.isha}`
            })
        }
    }
    else {
        return Promise.resolve(null);
    }
}

function findSurrogatePair(point) {
    // assumes point > 0xffff
    var offset = point - 0x10000,
        lead = 0xd800 + (offset >> 10),
        trail = 0xdc00 + (offset & 0x3ff);
    return [lead.toString(16), trail.toString(16)];
  }