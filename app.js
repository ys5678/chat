'use strict'

var express = require('express')
var path = require('path')
var IO = require('socket.io')
var router = express.Router()
var mongoose = require('mongoose')
require('./model/user')
var User = mongoose.model('User')
var bodyParser = require('body-parser')
var co = require('co')
var app = express()
var server = require('http').Server(app)
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// 创建socket服务
var socketIO = IO(server)
// 房间用户名单
var roomInfo = {}
var users = []
var sockets = []

socketIO.on('connection', function (socket) {
  // 获取请求建立socket连接的url
  // 如: http://localhost:3000/room/room_1, roomID为room_1
  // var url = socket.request.headers.referer;
  // var splited = url.split('/');
  // var roomID = splited[splited.length - 1];   // 获取房间ID
  var user = ''

  socket.on('join', function (userName) {
    if (!userName || userName.length === 0) {
      userName = '无名'
    }
    user = userName

    // 将用户昵称加入房间名单中
    // if (!roomInfo[roomID]) {
    //  roomInfo[roomID] = [];
    // }
    // roomInfo[roomID].push(user);
    users.push({name: user, id: socket.id})
    sockets[user] = socket

    // socket.join(roomID);    // 加入房间
    // 通知房间内人员
    // socketIO.to(roomID).emit('sys', user + '加入了房间', roomInfo[roomID]);
    socketIO.emit('sys', users) // users是socket对象，超出了发送的大小
    console.log(user + '加入了')
    // console.info(roomInfo);
  })

  socket.on('private_message', function (from, to, msg) {
    var target = sockets[to]
    if (target) {
      console.log('emitting private message by ', from, ' say to ', to, msg)
      target.emit('pmsg', from, to, msg)
    }
  })

  // socket.on('leave', function () {
  //   socket.emit('disconnect')
  // })

  socket.on('disconnect', function () {
    // 从房间名单中移除
    // var index = roomInfo[roomID].indexOf(user);
    // if (index !== -1) {
    //  roomInfo[roomID].splice(index, 1);
    // }
    //
    // socket.leave(roomID);    // 退出房间
    // socketIO.to(roomID).emit('sys', user + '退出了房间', roomInfo[roomID]);
    var index = users.indexOf(user)
    users.splice(index, 1)
    sockets.splice(index, 1)
    socketIO.emit('sys', users) // users是socket对象，超出了发送的大小
    console.log(user + '退出了')
  })

  // 接收用户消息,发送相应的房间
  // socket.on('message', function (msg) {
  //   // 验证如果用户不在房间内则不给发送
  //   if (roomInfo[roomID].indexOf(user) === -1) {
  //     return false
  //   }
  //   socketIO.to(roomID).emit('msg', user, msg)
  // })
})

// room page
router.get('/room/:roomID', function (req, res) {
  var roomID = req.params.roomID

  // 渲染页面数据(见views/room.hbs)
  res.render('room', {
    roomID: roomID,
    users: roomInfo[roomID]
  })
})

// regist page
router.get('/regist', function (req, res) {
  // 渲染页面数据(见views/login.hbs)
  res.render('login')
})

// index page
router.get('/index', function (req, res) {
  // 渲染页面数据(见views/index.hbs)
  res.render('index', {
    users: users
  })
})

// 提交用户注册数据
router.post('/post/user', function (req, res) {
  console.info(req.body)
  var body = req.body
  co(function *() {
    var findUser = yield User.findOne({username: body.username})
    if (findUser) {
      console.info(findUser)
      res.send({code: 200, result: 'already'})
    } else {
      var user = new User(body)
      var ret = yield user.add()
      console.info(ret)
      if (ret && ret._id) {
        res.send({code: 200, result: 'success'})
      } else {
        res.send({code: 500, result: 'fail'})
      }
    }
  })
})

app.use('/', router)

server.listen(3000, function () {
  console.log('server listening on port 3000')
})
