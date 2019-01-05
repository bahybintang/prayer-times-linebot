var schedule = require('node-schedule')
var prayer = require('./PrayerTimes')
var app = require('express')()
var line = require('@line/bot-sdk')

var prayerTimes = prayer.getTimes(new Date(), [-7.797068, 110.370529, 113], 7, 0, "24h")

var user = []

const config = {
    channelAccessToken: 'QPpBgdobbUDWp/UbPt4ejatkYIqKnBkSl4o1ZMTuxhsCI/Y9o8KE/LrRqTwl33m4hh/oaVbN1JJaQWeDtbkCUe6+AdOgQiPh6B9JiY8B742vlwyKGiwdTvw645gqBb3JVHh0YipcMT9AMmiG65Ia8gdB04t89/1O/w1cDnyilFU=',
    channelSecret: '8bce73487a599e8b2852357e49d803e3'
}

const client = new line.Client(config);

schedule.scheduleJob("1 0 * * *", () => {
    prayerTimes = prayer.getTimes(new Date(), [-7.797068, 110.370529, 113], 7, 0, "24h")
})

schedule.scheduleJob("*/15 * * * * *", () => {
    console.log("casted")
    if(user.length !== 0){
        client.multicast(user, {
            type: "text",
            text: "test"
        }).catch(err => {
            console.log(err)
        })
    }
})

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
    const message = event.message

    if(event.type === "message" && message.type === "text"){
        if(message.text === "start") {
            return client.replyMessage(event.replyToken, {
                type : "text",
                text : `Inisialisasi berhasil! ${String.fromCodePoint(0x10007A)}`
            })
        }
        else if(message.text === "waktu sholat"){
            var utc = new Date().toJSON().slice(0,10).replace(/-/g,'/');
            return client.replyMessage(event.replyToken, {
                type : "text",
                text : `${String.fromCodePoint(0x1000A8)} Waktu sholat untuk ${utc} ${String.fromCodePoint(0x1000A8)} \n\nSubuh\t: ${prayerTimes.fajr}\nDhuhur\t: ${prayerTimes.dhuhr}\nAshar\t: ${prayerTimes.asr}\nMaghrib\t: ${prayerTimes.maghrib}\nIsya\t: ${prayerTimes.isha}`
            })
        }
    }
    else if (event.type === "follow") {
        var source = event.source.userId ? event.source.userId : event.source.groupId
        user.push(source)
    }
    else {
        return Promise.resolve(null);
    }
}