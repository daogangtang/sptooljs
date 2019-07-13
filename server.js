
var arguments = process.argv.splice(2);
//console.log('所传递的参数是：', arguments);

//////////////////////////
// print process.argv
// process.argv.forEach(function (val, index, array) {
//   console.log(index + ': ' + val);
// });

if (arguments[0] == null || arguments[1] == null) {
    return console.log("缺少参数。第一个参数是 串口号，第二个参数是 波特率")
}

var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({port: 8080});

const SerialPort = require('serialport');
const port = new SerialPort(arguments[0] || 'COM1', {
    baudRate: parseInt(arguments[1]) || 115200
});


wss.on('connection', function(ws) {
    // console.log(ws);

    ws.on('message', function(message) {
        console.log(message);
        var jsonvar = JSON.parse(message);

        if (jsonvar.type == "idnum") {
            var idnum = jsonvar.data;
            // 向串口发送写指令
            var json_write = {
                MSGID: "",
                TYPE: 'WRITE_DEVICE',
                DEVICE_ID: "",
                IC_ID: idnum.toString(),  // 这里由上层业务产生一个新卡号
                TIME: (new Date().getTime()).toString(),
                MSG: "WRITE"
            };
            port.write(JSON.stringify(json_write), function(err) {
                if (err) {
                    return console.log('Error on write: ', err.message)
                }
                console.log("write: ", JSON.stringify(json_write));
            })

            // var json_ack = {
            //     type: "ack",
            //     data: "ok"
            // };
            // ws.send(JSON.stringify(json_ack));
        }
        

    });

    ws.on('close', function(message) {
        // 连接关闭时，将其移出连接池
        console.log('close');
 
    });


    // Switches the port into "flowing mode"
    port.on('data', function (data) {
        console.log('Data:', data)
        console.log('Data:', data.length)
        var p = JSON.parse(data);

        if (p.MSG == "HAVE_CARD") {
            var json_write = {
                MSGID: p.MSGID,
                TYPE: p.TYPE,
                DEVICE_ID: p.DEVICE_ID,
                IC_ID: Math.floor(Math.random() * 1000000) + 10000,
                TIME: (new Date().getTime()).toString(),
                MSG: "WRITE"
            };
            port.write(JSON.stringify(json_write), function(err) {
                if (err) {
                    return console.log('Error on write: ', err.message)
                }
                // console.log('message written')
            })
        }
        else if (p.MSG == "WRITE_OK") {
            // 写成功，响应
            var json_ack = {
                type: "ack",
                data: "ok"
            };
            ws.send(JSON.stringify(json_ack));

        }
        else if (p.MSG == "HEART") {
            var json_write = {
                MSGID: p.MSGID,
                TYPE: p.TYPE,
                DEVICE_ID: p.DEVICE_ID,
                IC_ID: p.IC_ID,  // 这里由上层业务产生一个新卡号
                TIME: (new Date().getTime()).toString(),
                MSG: "HEART_OK"
            };
            port.write(JSON.stringify(json_write), function(err) {
                if (err) {
                    return console.log('Error on write: ', err.message)
                }
                // console.log('message written')
            })
        }
        else if (p.MSG == "UPDATA") {
            var json_write = {
                MSGID: p.MSGID,
                TYPE: p.TYPE,
                DEVICE_ID: p.DEVICE_ID,
                IC_ID: p.IC_ID,  // 这里由上层业务产生一个新卡号
                TIME: (new Date().getTime()).toString(),
                MSG: "UPDATA_OK"
            };
            port.write(JSON.stringify(json_write), function(err) {
                if (err) {
                    return console.log('Error on write: ', err.message)
                }
                // console.log('message written')
            })
        }

        


    })
    


    // Open errors will be emitted as an error event
    port.on('error', function(err) {
    console.log('Error: ', err.message)
    })

});




// {"MSGID":"12345678","TYPE":"WRITE_DEVICE","DEVICE_ID":"10000001","IC_ID":"12345678","MSG":"HAVE_CARD","TIME":""}
// {"MSGID":"12345678","TYPE":"WRITE_DEVICE","DEVICE_ID":"10000001","IC_ID":"10001111","MSG":"WRITE","TIME":""}
// {"MSGID":"12345678","TYPE":"WRITE_DEVICE","DEVICE_ID":"10000001","IC_ID":"10001111","MSG":"WRITE_OK","TIME":""}
// {"MSGID":"0","TYPE":"4G_GPS_DEVICE","DEVICE_ID":"10000001","IC_ID":"","TIME":"0","MSG":"HEART","LON":"12.345678","LAT":"22.222222"}
// {"MSGID":"0","TYPE":"4G_GPS_DEVICE","DEVICE_ID":"10000001","IC_ID":"","TIME":"68000012","MSG":"HEART_OK"}
// {"MSGID":"12345678","TYPE":"4G_GPS_DEVICE","DEVICE_ID":"10000001","IC_ID":"10000001-68000123","TIME":"68000012","MSG":"UPDATA"}
// {"MSGID":"12345678","TYPE":"4G_GPS_DEVICE","DEVICE_ID":"10000001","IC_ID":"","TIME":"68000012","MSG":"UPDATA_OK"}
