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

app.set('port', process.env.PORT || 5000)

app.listen(app.get('port'), () => {
    console.log(`Connected to port ${app.get('port')}!`)
})

app.post('/', line.middleware(config), (req, res) => {
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result));
})

function handleEvent (event) {
    const message = event.message

    if(event.type == "message" && message.type == "text"){
        if(message.text == "start") {
            return client.replyMessage(event.replyToken, {
                type : "text",
                text : "Inisialisasi berhasil! (moon grin)"
            })
        }
        else if(message.text == "waktu sholat"){
            var utc = new Date().toJSON().slice(0,10).replace(/-/g,'/');
            return client.replyMessage(event.replyToken, {
                type : "text",
                text : `\0x1000A8 Waktu sholat untuk ${utc} \0x1000A8 \n
                        Subuh   : ${prayerTimes.fajr}\n
                        Dhuhur  : ${prayerTimes.dhuhr}\n
                        Ashar   : ${prayerTimes.asr}\n
                        Maghrib : ${prayerTimes.maghrib}\n
                        Isya    : ${prayerTimes.isha}\n`
            })
        }
    }
    else {
        return Promise.resolve(null);
    }
}