var request = require('request')
var W3CWebSocket = require('websocket').w3cwebsocket;

function fancyTimeFormat(ms) {
    var current = Math.round(new Date().getTime() / 1000);
    // console.log(ms, current)
    var t = Math.abs(ms - current);
    var days = parseInt(t / 86400);
    t = t - (days * 86400);
    var hours = parseInt(t / 3600);
    t = t - (hours * 3600);
    var minutes = parseInt(t / 60);
    t = t - (minutes * 60);
    var seconds = t;

    days = ("00" + days).substr(-2);
    hours = ("00" + hours).substr(-2);
    minutes = ("00" + minutes).substr(-2);
    seconds = ("00" + seconds).substr(-2);

    return `${hours}:${minutes}:${seconds}`
}

scenes = {}

request('https://www.reddit.com/sequence', function (error, response, body) {
    regex = /((?:wss:\/\/)[-\w]+(?:\.[-\w]+)*(?::\d+)?\/sequence\?([\w\+%&=.;:-]+)?(?:\#[\w\-\.]*)?)/gmi;
    wss_url = regex.exec(body)[0];

    var ws = new W3CWebSocket(wss_url);
    ws.onopen = function() {
        console.log(`connected to ${wss_url}`);

        ws.send("ping");
        setInterval(() => {
            console.log('\033[2J');
            for(let chapter in scenes) {
                for (let scene in scenes[chapter]) {
                    data = scenes[chapter][scene];
                    if(+ new Date() < new Date(data.lock_time)) {
                        console.log(`[Chapter ${chapter}][Scene ${("00" + scene).substr(-2)}] ${new Date(data.lock_time)} (in ${fancyTimeFormat(data.lock_time / 1000)})`);
                    }
                    else {
                        delete scenes[chapter][scene];
                    }
                }
            }
        }, 1000);
    };

    ws.onclose = function() {
        console.log('wss closed');
    };

    ws.onmessage = function(e) {
        if (typeof e.data === 'string') {
            var _scenes = JSON.parse(e.data).payload.remaining_scenes;
            for(let key in _scenes) {
                if(!scenes[key.split("_")[0]]) scenes[key.split("_")[0]] = {};
                scenes[key.split("_")[0]][key.split("_")[1]] = _scenes[key];
            }
        }
    };
})