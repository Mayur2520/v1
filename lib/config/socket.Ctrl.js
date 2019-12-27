module.exports = function (socketio) {
    socketio.on('connection', (socket) => {
        console.log(socket.socket);
        socket.on('disconnect', function(){
            socketio.emit('users-changed', {user: socket.nickname, event: 'left'});   
        });
       
        socket.on('set-nickname', (nickname) => {
          socket.nickname = nickname;
          socketio.emit('users-changed', {user: nickname, event: 'joined'});    
        });
        
        socket.on('add-message', (message) => {
            socketio.emit('message', {text: message.text, from: socket.nickname, created: new Date()});    
        });
      });
      
};