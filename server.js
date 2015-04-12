var net = require('net');
var pid = "/var/run/mtcr.pid";
var port = 42581;
var version = {
    protocol: 0x1,
    server: "0.1.0",
    client: "0.0.0"
};

var clients = [];

for (var i = 0; i < 256; ++i) {
    clients[i] = {
        socket: null,
        nickname: null,
        state: 0, // 0 = disconnected, 1 = connected, 2 = joined, 3 = wait for pw
    };
}

var strToBin = function(str) {
    return new Buffer(str);
};

var numToBin = function(len,num) {
    var b = new Buffer(len);
    while (len--) {
        b[len] = num % 256;
        num /= 256;
    }
    return b;
}

var getMinDisconnectedUID = function() {
    for (var i = 0; i < 256; ++i)
        if (clients[i].state == 0)
            return i;
    return -1;
};

var sendToAllClients = function(pkg) {
    for (var uuid in clients) {
        clients[uuid].socket.write(pkg);
    }
}

var cmpBin = function(len, a, b) {
    for (var i = 0; i < len; ++i)
        if (a[i] - b[i]) return i;
    return -1;
}

var getPkg = {
    version: function() {
        return new Buffer(
            "MTCR" + numToBin(1, version.protocol) + "\x00"
            + numToBin(1, version.client.length) + version.client
            + numToBin(1, version.server.length) + version.server
        );
    },
    loginOk: function() {
        return new Buffer(
            "MTCR" + numToBin(1, version.protocol) + "\x10"
        );
    },
    loginFail: function() {
        return new Buffer(
            "MTCR" + numToBin(1, version.protocol) + "\x11"
        );
    },
    pwRequire: function() {
        return new Buffer(
            "MTCR" + numToBin(1, version.protocol) + "\x20"
        );
    },
    pwFail: function() {
        return new Buffer(
            "MTCR" + numToBin(1, version.protocol) + "\x21"
        );
    },
    join: function(uid, nickname) {
        return new Buffer(
            "MTCR" + numToBin(1, version.protocol) + "\x30"
            + numToBin(1, uid)
            + numToBin(1, nickname.length) + nickname
        );
    },
    leave: function(uid) {
        return new Buffer(
            "MTCR" + numToBin(1, version.protocol) + "\x31"
            + numToBin(1, uid)
        );
    },
    nickChange: function(uid, nickname) {
        return new Buffer(
            "MTCR" + numToBin(1, version.protocol) + "\x40"
            + numToBin(1, uid)
            + numToBin(1, nickname.length) + nickname
        );
    },
    nickChangeOk: function() {
        return new Buffer(
            "MTCR" + numToBin(1, version.protocol) + "\x41"
        );
    },
    nickChangeFail: function() {
        return new Buffer(
            "MTCR" + numToBin(1, version.protocol) + "\x42"
        );
    },
    msg: function(uid, color, message) {
        return new Buffer(
            "MTCR" + numToBin(1, version.protocol) + "\x50"
            + numToBin(1, uid)
            + numToBin(1, color)
            + numToBin(2, message.length) + message
        );
    },
    msgPrivate: function(uidFrom, uidTo, color, message) {
        return new Buffer(
            "MTCR" + numToBin(1, version.protocol) + "\x51"
            + numToBin(1, uidFrom)
            + numToBin(1, uidTo)
            + numToBin(1, color)
            + numToBin(2, message.length) + message
        );
    },
    msgPrivateOk: function() {
        return new Buffer(
            "MTCR" + numToBin(1, version.protocol) + "\x52"
        );
    },
    msgPrivateFail: function() {
        return new Buffer(
            "MTCR" + numToBin(1, version.protocol) + "\x53"
        );
    },
    msgServer: function(message) {
        return new Buffer(
            "MTCR" + numToBin(1, version.protocol) + "\x54"
            + numToBin(2, message.length) + message
        );
    },
    msgServerPrivate: function(message) {
        return new Buffer(
            "MTCR" + numToBin(1, version.protocol) + "\x55"
            + numToBin(2, message.length) + message
        );
    },
    online: function() {
        var count = 0, list = "";
        for (var i = 0; i < 256; ++i)
            if (clients[i].state == 2) {
                ++count;
                list += new Buffer(numToBin(1, i) + numToBin(1, clients[i].nickname.length) + clients[i].nickname);
            }

        return new Buffer(
            "MTCR" + numToBin(1, version.protocol) + "\x60"
            + numToBin(1, count) + list
        );
    },
    unknown: function() {
        return new Buffer(
            "MTCR" + numToBin(1, version.protocol) + "\xff"
            + "Sorry but I could not understand what you want to do."
        );
    }
};

net.createServer(function (sock) {
    var uid = getMinDisconnectedUID();

    if (uid < 0) {
        sock.destroy();
        return;
    }

    console.log("[DEBUG] Connected from " + sock.remoteAddress + ":" + sock.remotePort + " with uid " + uid + ".");

    sock.on('data', function(data) {
        console.log("[DEBUG] Got data from uid " + uid + ": " + data);

        if (cmpBin(4, data, new Buffer("MTCR")) != -1 || data[4] != version.protocol) {
            sock.write(getPkg.unknown());
            return;
        }

        var type = data[5];
        switch (type) {
            case 0x00:
                sock.write(getPkg.version());
                break;
            case 0x10:
                var nicknameLength = data[6];
                var nickname = data.slice(7, 7 + nicknameLength);
                break;
//            case 0x20:
//                var passwordLength = data[6];
//                var password = data.slice(7, passwordLength);
//                break;
//            case 0x40:
//                var nicknameLength = data[6];
//                var nickname = data.slice(7, 7 + nicknameLength);
//                break;
            case 0x50:
                var color = data[6];
                var messageLength = data[7] + data[8] * 256;
                var message = data.slice(9, 9 + messageLength);

                sendToAllClients(getPkg.msg(uid, color, message));
                break;
            case 0x51:
                var toUID = data[6];
                var color = data[7];
                var messageLength = data[8] + data[9] * 256;
                var message = data.slice(10, 10 + messageLength);

                if (clients[uid].state == 2 && clients[toUID].state == 2) {
                    clients[toUID].socket.write(getPkg.msgPrivate(uid, toUID, color, message));
                    sock.write(getPkg.msgPrivate(uid, toUID, color, message));
                    sock.write(getPkg.msgPrivateOk());
                } else {
                    sock.write(getPkg.msgPrivateFail());
                }

                break;
            case 0x60:
                sock.write(getPkg.online());
                break;
            default:
                sock.write(getPkg.unknown());
        }
    });

    sock.on('close', function () {
        console.log("[DEBUG] Closed by uid " + uid + ".");
        if (clients[uid].state == 2) {
            sendToAllClients(getPkg.leave(uid));
        }
    });
}).listen(42581);
