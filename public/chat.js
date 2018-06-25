var socket = io.connect(window.location.host);
var userClickedId, userClickedName, room_id, clicked;
function notifyMe(sender_name, message) {
  if (!('Notification' in window)) {
    alert('This browser does not support desktop notification');
  } else if (Notification.permission === 'granted') {
    var options = {
      body: 'there is the message from' + sender_name,
      icon: 'icon.jpg',
      dir: 'ltr',
    };
    var notification = new Notification('Hi there', options);
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission(function(permission) {
      if (!('permission' in Notification)) {
        Notification.permission = permission;
      }
      if (permission === 'granted') {
        var options = {
          body: 'This is the body of the notification' + sender_name,
          icon: 'icon.jpg',
          dir: 'ltr',
        };
        var notification = new Notification(message, options);
      }
    });
  }
}
function userClicked(e) {
  $(`#${clicked}`).css('color', 'white');
  var userId = $('#userId').val();
  var feedback = $('.feedback');
  feedback.html('');
  $('.chat-with').text(e.target.value);
  userClickedId = e.target.id;
  clicked = userClickedId;
  userClickedName = e.target.value;
  room_id = $(`#room${userClickedId}`).val();
  socket.emit('roomId', room_id);
  $(`#${userClickedId}`).css('color', '#5f9fe4');
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
          if (response[x].sender_id._id == userClickedId) {
            html +=
              "<b><div class='msg' style='background-color:#5f9fe4;border-radius: 25px;'><div class='user'>" +
              response[x].sender_id.name +
              ':</b><br>' +
              "</div><div class='txt'>" +
              response[x]['message'] +
              '</div></div><br>';
          } else {
            html +=
              "<b><div class='msg'  style='background-color: #58b666;left: 60rem;position: relative; border-radius: 25px;'><div class='user' >" +
              response[x].sender_id.name +
              ':</b><br>' +
              "</div><div class='txt'>" +
              response[x]['message'] +
              '</div></div><br>';
          }
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
  var userId = $('#userId').val();
  var userName = $('#userName').val();
  socket.emit('userId', { userId, userName });
  var message = $('#message');
  var username = $('#username');
  var send_message = $('#send_message');
  var send_username = $('#send_username');
  var chatroom = $('#chatroom');
  var feedback = $('.feedback');
  var e = document.querySelectorAll('.roomId');
  for (var i = 0; i < e.length; i++) {
    val = e[i].value;
    if (!val.includes(':')) {
      if (val < userId) {
        e[i].value = `${val}:${userId}`;
      } else {
        e[i].value = `${userId}:${val}`;
      }
      console.log('---', e[i].value, '=====');
    }
    console.log(val);
  }
  socket.on('change_status', data => {
    console.log(data);
    if (data.status == 'online') {
      $(`#icon${data.id}`).css('color', 'green');
      $(`.${data.id}`).css('color', '#f5f5f5');
    } else {
      $(`#icon${data.id}`).css('color', 'white');
      $(`.${data.id}`).css('color', '#6a6c75');
    }
    $(`.${data.id}`).text(data.status);
  });
  socket.on('new_message', data => {
    feedback.html('');
    message.val('');
    chatroom.append("<p class='message'>" + data.username + ': ' + data.message + '</p>');
  });
  send_username.click(function() {
    socket.emit('change_username', { username: username.val() });
  });
  $('#message').focus(() => {
    if (message.val()) {
      socket.emit('typing', { userClickedId: userClickedId, loginId: userId, typing: 1 });
    }
  });
  $('#message').focusout(() => {
    socket.emit('typing', { userClickedId: userClickedId, loginId: userId, typing: 0 });
  });
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
            if (userClickedId == userId) {
              // notifyMe(userClickedName);
            }
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
    // console.log('----', room_id, userClickedId, userId);

    var sender_id = data.sender_id;
    var sender_name = data.sender_name;
    var message = data.message;
    console.log('----', room_id, '\nclicked--', userClickedId, '\n useris,', userId, '\nsenderid', sender_id);
    if (userId != sender_id) {
      notifyMe(data.sender_name, data.message);
    }
    if (sender_id == userClickedId) {
      var html =
        "<div class='msg' style='background-color:#5f9fe4;border-radius: 25px;'><b><div class='user'>" +
        sender_name +
        "</b></div><div class='txt'>" +
        message +
        '</div></div><br>';
    } else {
      var html =
        "<div class='msg' style='background-color:#58b666; left: 60rem;position: relative; border-radius: 25px;'><div class='user'>" +
        sender_name +
        "</div><div class='txt'>" +
        message +
        '</div></div><br>';
    }
    $('.messages').append(html);
  });
});
