### 一对一聊天
socket.io提供[rooms和namespace的API](http://socket.io/docs/rooms-and-namespaces/)
用rooms的API就可以实现一对一聊天了
```
// join
socket.on('join', function(userName){
  //存user	
  socketIO.emit('sys', users)
});

// say to room
socket.on('private_message', function (from, to, msg) {
  var target = sockets[to]
  if (target) {
    console.log('emitting private message by ', from, ' say to ', to, msg)
    target.emit('pmsg', from, to, msg)
  }
  })
  
//leave
  socket.on('disconnect', function () {
    //从users、sockets中移除
    var index = users.indexOf(user)
    users.splice(index, 1)
    sockets.splice(index, 1)
    socketIO.emit('sys', users) // users是socket对象，超出了发送的大小
    console.log(user + '退出了')
  })
```

### get start
```
npm install
node app
http://localhost:3000/regist
```

其中用mongodb存用户,所以在运行前先开mongo