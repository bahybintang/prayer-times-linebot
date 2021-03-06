var schedule = require('node-schedule')
let rule = new schedule.RecurrenceRule();
var prayer = require('./PrayerTimes')
var app = require('express')()
var _ = require('lodash')
var line = require('@line/bot-sdk')
var con = require('./models')
require('newrelic')

var user = []
var groups = []

prayer.setMethod('Egypt');
var prayerTimes = prayer.getTimes(new Date(), [-7.797068, 110.370529], 7, 0, "24h")

const config = require('./config').line

const client = new line.Client(config);

schedule.scheduleJob("init", "1 0 * * *", scheduling)

app.set('port', (process.env.PORT || 5000))

app.listen(app.get('port'), () => {
    console.log(`Connected to port ${app.get('port')}!`)
})

app.post('/', line.middleware(config), (req, res) => {
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result));
})

function handleEvent(event) {
    const message = event.message

    if (event.type === "message" && message.type === "text") {
        var msg = message.text
        message.text = message.text.toLowerCase()
        if(message.text.split('//')[0] == "sendall") {
            con.query("SELECT id FROM user", (err, data) => {
                if(err){
                    console.log(err)
                }
                else {
                    user = []
                    groups = []
                    
                    for(var dt of data){
                        if(dt.type === "user"){
                            user.push(dt.id)
                        }
                        else {
                            groups.push(dt.id)
                        }
                    }

                    console.log(user)

                    if(user.length !== 0){
                        client.multicast(user, {
                            type: "text",
                            text: `${msg.split('//')[1]}`
                        }).catch(err => {
                            console.log(err)
                        })
                    }

                    if(groups.length !== 0) {
                        for(var group of groups){
                            client.pushMessage(group, {
                                type: "text",
                                text: `${msg.split('//')[1]}`
                            }).catch(err => {
                                console.log(err)
                            })
                        }
                    }
                }
            })
        }
        else if (message.text === "start") {
            var source = event.source.groupId ? event.source.groupId : event.source.userId
            var type = event.source.groupId ? "group" : "user"
            con.query(`INSERT INTO user (id, type) VALUES ('${source}', '${type}')`, (err, data) => { 
                if (err) {
                    console.log(err); 
                } 
                else {
                    scheduling();
                }
            })

            return client.replyMessage(event.replyToken, {
                type: "text",
                text: `Inisialisasi berhasil! ${String.fromCodePoint(0x10007A)}`
            })
        }
        else if (message.text === "waktu sholat text") {
            return client.replyMessage(event.replyToken, {
                type: "text",
                text: `${String.fromCodePoint(0x1000A8)} Waktu sholat untuk hari ini ${String.fromCodePoint(0x1000A8)} \n\nSubuh    : ${prayerTimes.fajr}\nDhuhur   : ${prayerTimes.dhuhr}\nAshar     : ${prayerTimes.asr}\nMaghrib  : ${prayerTimes.maghrib}\nIsya      : ${prayerTimes.isha}`
            })
        }
        else if (message.text === "waktu sholat") {
            return client.replyMessage(event.replyToken, {
                "type": "flex",
                "altText": "Jadwal Sholat Hari Ini",
                "contents": {
                    "type": "bubble",
                    "body": {
                        "type": "box",
                        "layout": "vertical",
                        "spacing": "md",
                        "contents": [
                            {
                                "type": "box",
                                "layout": "vertical",
                                "contents": [
                                    {
                                        "type": "text",
                                        "text": `Jadwal Sholat Hari Ini`,
                                        "wrap": true,
                                        "weight": "bold",
                                        "margin": "lg"
                                    }
                                ]
                            },
                            {
                                "type": "separator"
                            },
                            {
                                "type": "box",
                                "layout": "vertical",
                                "margin": "lg",
                                "contents": [
                                    {
                                        "type": "box",
                                        "layout": "baseline",
                                        "contents": [
                                            {
                                                "type": "text",
                                                "text": "Subuh ",
                                                "flex": 5,
                                                "size": "lg",
                                                "weight": "bold",
                                                "color": "#666666"
                                            },
                                            {
                                                "type": "text",
                                                "text": `${prayerTimes.fajr}`,
                                                "wrap": true,
                                                "flex": 5
                                            }
                                        ]
                                    },
                                    {
                                        "type": "box",
                                        "layout": "baseline",
                                        "contents": [
                                            {
                                                "type": "text",
                                                "text": "Dhuhur ",
                                                "flex": 5,
                                                "size": "lg",
                                                "weight": "bold",
                                                "color": "#666666"
                                            },
                                            {
                                                "type": "text",
                                                "text": `${prayerTimes.dhuhr}`,
                                                "wrap": true,
                                                "flex": 5
                                            }
                                        ]
                                    },
                                    {
                                        "type": "box",
                                        "layout": "baseline",
                                        "contents": [
                                            {
                                                "type": "text",
                                                "text": "Ashar ",
                                                "flex": 5,
                                                "size": "lg",
                                                "weight": "bold",
                                                "color": "#666666"
                                            },
                                            {
                                                "type": "text",
                                                "text": `${prayerTimes.asr}`,
                                                "wrap": true,
                                                "flex": 5
                                            }
                                        ]
                                    },
                                    {
                                        "type": "box",
                                        "layout": "baseline",
                                        "contents": [
                                            {
                                                "type": "text",
                                                "text": "Maghrib",
                                                "flex": 5,
                                                "size": "lg",
                                                "weight": "bold",
                                                "color": "#666666"
                                            },
                                            {
                                                "type": "text",
                                                "text": `${prayerTimes.maghrib}`,
                                                "wrap": true,
                                                "flex": 5
                                            }
                                        ]
                                    },
                                    {
                                        "type": "box",
                                        "layout": "baseline",
                                        "contents": [
                                            {
                                                "type": "text",
                                                "text": "Isya",
                                                "flex": 5,
                                                "size": "lg",
                                                "weight": "bold",
                                                "color": "#666666"
                                            },
                                            {
                                                "type": "text",
                                                "text": `${prayerTimes.isha}`,
                                                "wrap": true,
                                                "flex": 5
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                }
            })
        }
    }
    else if (event.type === "follow") {
        var source = event.source.groupId ? event.source.groupId : event.source.userId
        var type = event.source.groupId ? "group" : "user"
        con.query(`INSERT INTO user (id, type) VALUES ('${source}', '${type}')`, (err, data) => { 
            if (err) {
                console.log(err); 
            } 
            else {
                scheduling();
            }
        })
    }
    else if (event.type === "join") {
        var source = event.source.groupId ? event.source.groupId : event.source.userId
        var type = event.source.groupId ? "group" : "user"
        con.query(`INSERT INTO user (id, type) VALUES ('${source}', '${type}')`, (err, data) => { 
            if (err) {
                console.log(err); 
            } 
            else {
                scheduling();
            }
        })

        return client.replyMessage(event.replyToken, {
            type: "text",
            text: `${String.fromCodePoint(0x1000A8)} Assalamualaikum wr. wb ${String.fromCodePoint(0x1000A8)}\nTerima kasih sudah menambahkan aku sebagai teman! \n\nSemoga dengan bot ini kamu lebih rajin sholat ya! ${String.fromCodePoint(0x10008D)}\n\nTenang aja, kamu bakal aku ingetin kok kalau waktu sholat datang! ${String.fromCodePoint(0x10008D)}`
        })
    }
    else if (event.type === "unfollow" || event.type === "leave") {
        var source = event.source.userId ? event.source.userId : event.source.groupId
        con.query(`DELETE FROM user WHERE id = ?`, [source], (err, data) => { if (err) { console.log(err) } })
    }
    return Promise.resolve(null);
}

function scheduling() {
    rule.tz = 'Asia/Jakarta'
    prayerTimes = prayer.getTimes(new Date(), [-7.797068, 110.370529, 113], 7, 0, "24h")

    const jobNames = _.keys(schedule.scheduledJobs);
    for (let name of jobNames) {
        console.log(name)
        if (name !== 'init' || name !== "refresh") {
            schedule.cancelJob(name)
        }
    }

    user = []
    groups = []

    con.query("SELECT id, type FROM user", (err, data) => {
        if(err){
            console.log(err)
        }
        else {
            for(var dt of data){
                if(dt.type === "user"){
                    user.push(dt.id)
                }
                else {
                    groups.push(dt.id)
                }
            }

            schedule.scheduleJob("dhuhr", `${Number(prayerTimes.dhuhr.split(':')[1])} ${Number(prayerTimes.dhuhr.split(':')[0])} * * *`, () => {
                if (user.length !== 0) {
                    client.multicast(user, {
                        type: "text",
                        text: `[Waktunya Dzuhur, Sholat lur]\n\n📢 Hayya 'alassholaah 📢\n"Suara adzan sudah berkumandang, itu tandanya Allah mengundang. Yuk lur, segera hadir menghadap-Nya."\n\nAmbil air wudhu-niatkan sholat dzuhur-sholatlah dengan khusyuk.\n\n#DzuhurTime\n#LillahiTa'ala`
                    }).catch(err => {
                        console.log(err)
                    })
                }
                if(groups.length !== 0){
                    for(var group of groups){
                        client.pushMessage(group, {
                            type: "text",
                            text: `[Waktunya Dzuhur, Sholat lur]\n\n📢 Hayya 'alassholaah 📢\n"Suara adzan sudah berkumandang, itu tandanya Allah mengundang. Yuk lur, segera hadir menghadap-Nya."\n\nAmbil air wudhu-niatkan sholat dzuhur-sholatlah dengan khusyuk.\n\n#DzuhurTime\n#LillahiTa'ala`
                        }).catch(err => {
                            console.log(err)
                        })
                    }
                }
            })
        
            schedule.scheduleJob("asr", `${Number(prayerTimes.asr.split(':')[1])} ${Number(prayerTimes.asr.split(':')[0])} * * *`, () => {
                if (user.length !== 0) {
                    client.multicast(user, {
                        type: "text",
                        text: `[Waktunya Ashar]\n\n📢Hayya 'alassholaah📢\nAdzan sudah berkumandang, Mari tegakkan sholat wahai hamba Allah ☺\n\nJadikanlah sholat itu sebagai kebutuhan, bukan penggugur kewajiban. InsyaAllah hidup ini akan terasa lengkap jika kebutuhan kita terpenuhi☺\n\nSo..\nPenuhi panggilan adzan, ambil air wudhu, niatkan sholat, sholatlah dengan khusyuk.\n\nSemoga ridho Allah selalu mengiringi disetiap ibadah kita, Aamiin😊`
                    }).catch(err => {
                        console.log(err)
                    })
                }

                if(groups.length !== 0){
                    for(var group of groups){
                        client.pushMessage(group, {
                            type: "text",
                            text: `[Waktunya Ashar]\n\n📢Hayya 'alassholaah📢\nAdzan sudah berkumandang, Mari tegakkan sholat wahai hamba Allah ☺\n\nJadikanlah sholat itu sebagai kebutuhan, bukan penggugur kewajiban. InsyaAllah hidup ini akan terasa lengkap jika kebutuhan kita terpenuhi☺\n\nSo..\nPenuhi panggilan adzan, ambil air wudhu, niatkan sholat, sholatlah dengan khusyuk.\n\nSemoga ridho Allah selalu mengiringi disetiap ibadah kita, Aamiin😊`
                        }).catch(err => {
                            console.log(err)
                        })
                    }
                }
            })
        
            schedule.scheduleJob("fajr", `${Number(prayerTimes.fajr.split(':')[1])} ${Number(prayerTimes.fajr.split(':')[0])} * * *`, () => {
                if (user.length !== 0) {
                    client.multicast(user, {
                        type: "text",
                        text: `[Waktunya Subuh, Sholat itu lebih baik daripada tidur]\n\n📢 Asholatu khairum minannaum 📢\n\n"Suara adzan sudah berkumandang, itu tandanya kita sudah diundang, oleh siapa? Ya, oleh-Nya."\n\nSo..\nPenuhi undangan-Nya, dengan mengambil air wudhu, lalu niatkan sholat subuh, sholatlah dengan khusyuk.\n\n#SemogaRidhoAllahSelaluMengiringiIbadahHamba-Nya. Aamiin😊`
                    }).catch(err => {
                        console.log(err)
                    })
                }

                if(groups.length !== 0){
                    for(var group of groups){
                        client.pushMessage(group, {
                            type: "text",
                            text: `[Waktunya Subuh, Sholat itu lebih baik daripada tidur]\n\n📢 Asholatu khairum minannaum 📢\n\n"Suara adzan sudah berkumandang, itu tandanya kita sudah diundang, oleh siapa? Ya, oleh-Nya."\n\nSo..\nPenuhi undangan-Nya, dengan mengambil air wudhu, lalu niatkan sholat subuh, sholatlah dengan khusyuk.\n\n#SemogaRidhoAllahSelaluMengiringiIbadahHamba-Nya. Aamiin😊`
                        }).catch(err => {
                            console.log(err)
                        })
                    }
                }
            })
        
            schedule.scheduleJob("isha", `${Number(prayerTimes.isha.split(':')[1])} ${Number(prayerTimes.isha.split(':')[0])} * * *`, () => {
                if (user.length !== 0) {
                    client.multicast(user, {
                        type: "text",
                        text: `[Waktunya Isya]\n\nHayya 'alassholaah📢\nAdzan sudah berkumandang, Mari tegakkan sholat wahai hamba Allah ☺\n\nJadikanlah sholat itu sebagai kebutuhan, bukan penggugur kewajiban. InsyaAllah hidup ini akan terasa lengkap jika kebutuhan kita terpenuhi☺\n\nPenuhi panggilan adzan, ambil air wudhu, niatkan sholat, sholatlah dengan khusyuk.\n\nSemoga ridho Allah selalu mengiringi disetiap ibadah kita, Aamiin😊`
                    }).catch(err => {
                        console.log(err)
                    })
                }

                if(groups.length !== 0){
                    for(var group of groups){
                        client.pushMessage(group, {
                            type: "text",
                            text: `[Waktunya Isya]\n\nHayya 'alassholaah📢\nAdzan sudah berkumandang, Mari tegakkan sholat wahai hamba Allah ☺\n\nJadikanlah sholat itu sebagai kebutuhan, bukan penggugur kewajiban. InsyaAllah hidup ini akan terasa lengkap jika kebutuhan kita terpenuhi☺\n\nPenuhi panggilan adzan, ambil air wudhu, niatkan sholat, sholatlah dengan khusyuk.\n\nSemoga ridho Allah selalu mengiringi disetiap ibadah kita, Aamiin😊`
                        }).catch(err => {
                            console.log(err)
                        })
                    }
                }
            })
        
            schedule.scheduleJob("maghrib", `${Number(prayerTimes.maghrib.split(':')[1])} ${Number(prayerTimes.maghrib.split(':')[0])} * * *`, () => {
                if (user.length !== 0) {
                    client.multicast(user, {
                        type: "text",
                        text: `[Waktunya Maghrib, Sholat sob]\n\n📢Hayya 'alassholaah📢\nAdzan sudah berkumandang, Mari tegakkan sholat wahai hamba Allah ☺\n\nJadikanlah sholat itu sebagai kebutuhan, bukan penggugur kewajiban. InsyaAllah hidup ini akan terasa lengkap jika kebutuhan kita terpenuhi☺\n\nSo..\n\nPenuhi panggilan adzan, ambil air wudhu, niatkan sholat, sholatlah dengan khusyuk.\n\nSemoga ridho Allah selalu mengiringi disetiap ibadah kita, Aamiin😊`
                    }).catch(err => {
                        console.log(err)
                    })
                }

                if(groups.length !== 0){
                    for(var group of groups){
                        client.pushMessage(group, {
                            type: "text",
                            text: `[Waktunya Maghrib, Sholat sob]\n\n📢Hayya 'alassholaah📢\nAdzan sudah berkumandang, Mari tegakkan sholat wahai hamba Allah ☺\n\nJadikanlah sholat itu sebagai kebutuhan, bukan penggugur kewajiban. InsyaAllah hidup ini akan terasa lengkap jika kebutuhan kita terpenuhi☺\n\nSo..\n\nPenuhi panggilan adzan, ambil air wudhu, niatkan sholat, sholatlah dengan khusyuk.\n\nSemoga ridho Allah selalu mengiringi disetiap ibadah kita, Aamiin😊`
                        }).catch(err => {
                            console.log(err)
                        })
                    }
                }
            })
        }
    })
}