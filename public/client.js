/*global io*/
var socket = io();

//listens to 'user' connection emitted by server on connection
socket.on('user', function(data){
  console.log(data);
  $('#num-users').text(data.currentUsers + ' users online');
  if (data.connected) {
    $('#messages').append(`<li><br>${data.name} has joined the chat</br>`)
  }
  else {
    $('#messages').append(`<li><br>${data.name} has left the chat</br>`)
  }

})
socket.on('chat message', function(data){ $('#messages').append($('<li>').text(data.name+': '+data.message))})



$( document ).ready(function() {
   
  // Form submittion with new message in field with id 'm'
  $('form').submit(function(){
    var messageToSend = $('#m').val();
    //send message to server here?
    socket.emit('chat message',  messageToSend)
    
    $('#m').val('');
    return false; // prevent form submit from refreshing page
  });
  
  
  
});
