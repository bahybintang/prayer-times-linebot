var schedule = require('node-schedule')
var prayer = require('./PrayerTimes')
var app = require('express')()
var _ = require('lodash')
var line = require('@line/bot-sdk')
require('newrelic')

prayer.setMethod('Egypt');
var prayerTimes = prayer.getTimes(new Date(), [-7.797068, 110.370529], 7, 0, "24h")

var user = []

const config = require('./config')

const client = new line.Client(config);

scheduling();

schedule.scheduleJob("init", "1 0 * * *", scheduling)

schedule.scheduleJob("refresh", "*/25 * * * *", () => {
    console.log("Refresh avoid sleeping!")
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
        message.text = message.text.toLowerCase()
        if(message.text === "start") {
            var source = event.source.userId ? event.source.userId : event.source.groupId
            var index = user.indexOf(source)

            if(index < 0){
                user.push(source)
            }

            return client.replyMessage(event.replyToken, {
                type : "text",
                text : `Inisialisasi berhasil! ${String.fromCodePoint(0x10007A)}`
            })
        }
        else if(message.text === "waktu sholat"){
            var utc = new Date().toJSON().slice(0,10).replace(/-/g,'/');
            return client.replyMessage(event.replyToken, {
                type : "text",
                text : `${String.fromCodePoint(0x1000A8)} Waktu sholat untuk ${utc} ${String.fromCodePoint(0x1000A8)} \n\nSubuh    : ${prayerTimes.fajr}\nDhuhur   : ${prayerTimes.dhuhr}\nAshar     : ${prayerTimes.asr}\nMaghrib  : ${prayerTimes.maghrib}\nIsya      : ${prayerTimes.isha}`
            })
        }
    }
    else if (event.type === "follow") {
        var source = event.source.userId ? event.source.userId : event.source.groupId
        var index = user.indexOf(source)

        if(index < 0){
            user.push(source)
        }
    }
    else if (event.type === "unfollow") {
        var source = event.source.userId ? event.source.userId : event.source.groupId
        var index = user.indexOf(source)
        if(index > -1) {
            user.splice(index, 1)
        }
    }
    else {
        return Promise.resolve(null);
    }
}

function scheduling() {
    prayerTimes = prayer.getTimes(new Date(), [-7.797068, 110.370529, 113], 7, 0, "24h")
    
    const jobNames = _.keys(schedule.scheduledJobs);
    for(let name of jobNames){
        console.log(name)
        if(name !== 'init' || name !== "refresh"){
            schedule.cancelJob(name)
        }
    }

    schedule.scheduleJob("dhuhr", `${prayerTimes.dhuhr.slice(':')[1]} ${prayerTimes.dhuhr.slice(':')[0]} * * *`, () => {
        if(user.length !== 0){
            client.multicast(user, {
                type: "text",
                text: `[Waktunya Dzuhur, Sholat lur]\n\n📢 Hayya 'alassholaah 📢\n"Suara adzan sudah berkumandang, itu tandanya Allah mengundang. Yuk lur, segera hadir menghadap-Nya."\n\nAmbil air wudhu-niatkan sholat dzuhur-sholatlah dengan khusyuk.\n\n#DzuhurTime\n#LillahiTa'ala`
            }).catch(err => {
                console.log(err)
            })
        }
    })

    schedule.scheduleJob("asr", `${prayerTimes.asr.slice(':')[1]} ${prayerTimes.asr.slice(':')[0]} * * *`, () => {
        if(user.length !== 0){
            client.multicast(user, {
                type: "text",
                text: `[Waktunya Ashar]\n\n📢Hayya 'alassholaah📢\nAdzan sudah berkumandang, Mari tegakkan sholat wahai hamba Allah ☺\n\nJadikanlah sholat itu sebagai kebutuhan, bukan penggugur kewajiban. InsyaAllah hidup ini akan terasa lengkap jika kebutuhan kita terpenuhi☺\n\nSo..\nPenuhi panggilan adzan, ambil air wudhu, niatkan sholat, sholatlah dengan khusyuk.\n\nSemoga ridho Allah selalu mengiringi disetiap ibadah kita, Aamiin😊`
            }).catch(err => {
                console.log(err)
            })
        }
    })

    schedule.scheduleJob("fajr", `${prayerTimes.fajr.slice(':')[1]} ${prayerTimes.fajr.slice(':')[0]} * * *`, () => {
        if(user.length !== 0){
            client.multicast(user, {
                type: "text",
                text: `[Waktunya Subuh, Sholat itu lebih baik daripada tidur]\n\n📢 Asholatu khairum minannaum 📢\n\n"Suara adzan sudah berkumandang, itu tandanya kita sudah diundang, oleh siapa? Ya, oleh-Nya."\n\nSo..\nPenuhi undangan-Nya, dengan mengambil air wudhu, lalu niatkan sholat subuh, sholatlah dengan khusyuk.\n\n#SemogaRidhoAllahSelaluMengiringiIbadahHamba-Nya. Aamiin😊`
            }).catch(err => {
                console.log(err)
            })
        }
    })

    schedule.scheduleJob("isha", `${prayerTimes.isha.slice(':')[1]} ${prayerTimes.isha.slice(':')[0]} * * *`, () => {
        if(user.length !== 0){
            client.multicast(user, {
                type: "text",
                text: `[Waktunya Isya]\n\nHayya 'alassholaah📢\nAdzan sudah berkumandang, Mari tegakkan sholat wahai hamba Allah ☺\n\nJadikanlah sholat itu sebagai kebutuhan, bukan penggugur kewajiban. InsyaAllah hidup ini akan terasa lengkap jika kebutuhan kita terpenuhi☺\n\nPenuhi panggilan adzan, ambil air wudhu, niatkan sholat, sholatlah dengan khusyuk.\n\nSemoga ridho Allah selalu mengiringi disetiap ibadah kita, Aamiin😊`
            }).catch(err => {
                console.log(err)
            })
        }
    })

    schedule.scheduleJob("maghrib", `${prayerTimes.maghrib.slice(':')[1]} ${prayerTimes.maghrib.slice(':')[0]} * * *`, () => {
        if(user.length !== 0){
            client.multicast(user, {
                type: "text",
                text: `[Waktunya Maghrib, Sholat sob]\n\n📢Hayya 'alassholaah📢\nAdzan sudah berkumandang, Mari tegakkan sholat wahai hamba Allah ☺\n\nJadikanlah sholat itu sebagai kebutuhan, bukan penggugur kewajiban. InsyaAllah hidup ini akan terasa lengkap jika kebutuhan kita terpenuhi☺\n\nSo..\n\nPenuhi panggilan adzan, ambil air wudhu, niatkan sholat, sholatlah dengan khusyuk.\n\nSemoga ridho Allah selalu mengiringi disetiap ibadah kita, Aamiin😊`
            }).catch(err => {
                console.log(err)
            })
        }
    })
}