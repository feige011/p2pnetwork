'use strict';//JavaScript 严格模式
var express = require("express");
var WebSocket = require("ws");
var bodyParser = require('body-parser');
var server_me;
var http_port = process.env.HTTP_PORT || 3002;
var p2p_port = process.env.FFF_PORT || 6002;
var sockets = [];
var initHttpServer = () => {
    var app = express();//创建express()实例
    app.use(bodyParser.json());
    process.stdin.setEncoding('utf-8');
    process.stdin.on('readable',function () {
        var chunk = process.stdin.read();
        if(chunk!==null){
            broadcast(chunk)
        }
    })

    // app.get("/peers", (req, res) => {
    //     console.log("feifei map:"+sockets.length)
    //     res.send(sockets.map(s => s._socket.remoteAddress + ':' + s._socket.remotePort));
    // });
    // app.post("/addPeer", (req, res) => {
    //     connectToPeers([req.body.peer])
    //     res.send([req.body.peer])
    // });
    // app.get('/getNum', (req, res) => {
    //     res.send(num);
    // })
    // app.post('/numAdd', (req, res) => {
    //     num++;
    //     broadcast(responseLatestMsg());//广播
    //     console.log('block added:' + num);
    //     res.send();
    // })

    app.listen(http_port, () => console.log('listening http on port: ' + http_port));
}
var initP2PServer = () => {
    var server = new WebSocket.Server({port: p2p_port});
    console.log(p2p_port-1);
    server.on('connection', ws => {
        console.log("feige!!!!!!!!!!is good");
        initConnection(ws)
    });
    var s="ws://localhost:"+(p2p_port-1);
    console.log(s);

    var socket = new WebSocket(s);
    server_me=socket
    socket.on('open', () =>{
        console.log("feige011 is back")
        initConnection(socket)
    } );
    socket.on('error', () => {
        console.log('connection failed');
    })
    console.log('listening websocket p2p port on:' + p2p_port);

}

var initConnection = (ws) => {//初始化链接
    sockets.push(ws);
    console.log("feifeifei:size="+sockets.length)
    for(var i=0;i<sockets.length;i++){
        console.log("feifeihaha:"+sockets[i]._socket.remoteAddress+":"+sockets[i]._socket.remotePort)
    }
    initMessageHandler(ws);
    initErrorHandler(ws);
}
var initMessageHandler=(ws)=>{
    ws.on('message',(data)=>{
        console.log("Received message"+data);
        if(ws!==server_me){
            console.log("fa song le shu ju")
            broadcast(data);
            // handleNum(data);
        }else{
            console.log("feifei**************"+sockets.length);
            for(var i=0;i<sockets.length;i++){
                console.log("feifei"+sockets[i]._socket.remoteAddress+":"+sockets[i]._socket.remotePort)
            }
            console.log("zu zhi le:"+ws._socket.remoteAddress+":"+ws._socket.remotePort)
            console.log("feifei***********************");
        }
    })
}
var initErrorHandler =(ws)=>{
    var closeConnection =(ws)=>{
        console.log('connection failed to peer: '+ws.url+" "+ws._socket.remoteAddress+":"+ws._socket.remotePort);
        sockets.splice(sockets.indexOf(ws),1);
    }
    ws.on('close',()=>closeConnection(ws));
    ws.on('error',()=>closeConnection(ws))
}
var write=(ws,message)=>{
    console.log("fa song gei le:"+ws._socket.remoteAddress+":"+ws._socket.remotePort)
    ws.send(message)
}
var broadcast=(message)=>{
    sockets.forEach(socket =>write(socket,message));
}
initHttpServer();
initP2PServer();
