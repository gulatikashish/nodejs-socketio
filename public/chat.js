var userClickedId, userClickedName, room;
function userClicked(e) {
  var feedback = $('.feedback');
  feedback.html('');
  $('.chat-with').text(e.target.value);
  userClickedId = e.target.id;
  userClickedName = e.target.value;
  $.ajax({
    url: '/getMessages',
    type: 'POST',
    dataType: 'json',
    data: {
      user_id: userClickedId,
    },
    success: function(response) {
      if (response.length > 0) {
        var message_count = response.length;
        var html = '';
        for (var x = 0; x < message_count; x++) {
          html +=
            "<b><div class='msg'><div class='user'>" +
            response[x].sender_id.name +
            ':</b><br>' +
            "</div><div class='txt'>" +
            response[x]['message'] +
            '</div></div>';
        }

        $('.messages').html(html);
      } else {
        html = '';
        $('.messages').html(html);
      }
    },
  });
}
$(function() {
  //make connection
  var socket = io.connect(window.location.host);
  var userId = $('#userId').val();
  var userName = $('#userName').val();
  socket.emit('socketid');
  socket.on('socketid', data => {});
  socket.emit('userId', userId);
  //buttons and inputs
  var message = $('#message');
  var username = $('#username');
  var send_message = $('#send_message');
  var send_username = $('#send_username');
  var chatroom = $('#chatroom');
  var feedback = $('.feedback');
  console.log(';;;;;;;;;;', socket.id);
  socket.on('change_status', data => {
    console.log('=============================', data);
    if (data.status == 'online') {
      $(`#icon${data.id}`).css('color', 'green');
    } else {
      $(`#icon${data.id}`).css('color', 'white');
    }
    $(`.${data.id}`).text(data.status);
  });
  //Emit message
  send_message.click(function() {
    console.log('====', userId, userClickedId);
    socket.emit('new_message', { message: message.val() });
  });

  //Listen on new_message
  socket.on('new_message', data => {
    feedback.html('');
    message.val('');
    chatroom.append("<p class='message'>" + data.username + ': ' + data.message + '</p>');
  });

  //Emit a username
  send_username.click(function() {
    socket.emit('change_username', { username: username.val() });
  });

  //Emit typing
  $('#message').focus(() => {
    if (message.val()) {
      socket.emit('typing', { userClickedId: userClickedId, loginId: userId, typing: 1 });
    }
  });
  $('#message').focusout(() => {
    socket.emit('typing', { userClickedId: userClickedId, loginId: userId, typing: 0 });
  });

  //Listen on typing
  socket.on('typing', data => {
    if (data.userClickedId === userId && data.loginId === userClickedId) {
      if (data.typing == 0) {
        feedback.html('');
      } else {
        feedback.html('<p><i>' + userName + ' is typing a message...' + '</i></p>');
      }
    }
  });
  $('a').click(function(event) {
    event.preventDefault();
    socket.emit('logout', userId);
    window.location.href = 'http://localhost:3000/logout';
  });

  $('#send-message').click(function() {
    var message = $.trim($('#message').val());
    if (message) {
      $.ajax({
        url: '/send_message',
        type: 'POST',
        dataType: 'json',
        data: {
          sender_id: $('#userId').val(),
          receiver_id: userClickedId,
          receiver_name: userClickedName,
          message: message,
        },
        success: function(response) {
          if (response.status == 'OK') {
            socket.emit('message', {
              sender_id: $('#userId').val(),
              message: message,
            });
            $('#message').val('');
          }
        },
      });
    }
  });

  socket.on('send', function(data) {
    var sender_id = data.sender_id;
    var sender_name = data.sender_name;
    var message = data.message;
    var html =
      "<div class='msg'><div class='user'>" + sender_name + "</div><div class='txt'>" + message + '</div></div>';
    $('.messages').append(html);
  });
});
