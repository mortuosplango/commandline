$(function() {
  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms
  var COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
  ];

  // Initialize variables
  var $window = $(window);
  var $usernameInput = $('.usernameInput'); // Input for username
  var $passwordInput = $('.passwordInput'); // Input for username
  var $messages = $('.messages'); // Messages area
  var $inputMessage = $('.inputMessage'); // Input message input box
  var $scoreMessages = $('.scoreMessages'); // Messages area
  var $scoreInputMessage = $('.scoreInputMessage'); // Input message input box
  var $voteMessages = $('.voteMessages'); // Messages area
  var $vote = $('.vote'); // Messages area


  var $loginPage = $('.login.page'); // The login page
  var $chatPage = $('.chat.page'); // The chatroom page

  // Prompt for setting a username
  var passwordOpt = 'pass';
  var username;
  var users  = [];
  var connected = false;
  var typing = false;
  var lastTypingTime;
  var $currentInput; //$usernameInput.focus();
  var $nextScoreMsg = 'ALL';

  var socket = io();

  function addParticipantsMessage (data) {
    var message = '';
    if (data.numUsers === 1) {
      message += "there is 1 participant";
    } else {
      message += "there are " + data.numUsers + " participants";
    }
    log(message);
  }

  // Sets the client's username
  function setUsername () {
    username = cleanInput($usernameInput.val().trim());
    password = cleanInput($passwordInput.val().trim());
    // If the username is valid
    //if (username && password === "offallynice" ) {
    if ( (username) && (password == passwordOpt) ) {
      $loginPage.fadeOut();
      $chatPage.show();
      $loginPage.off('click');
      //$currentInput = $inputMessage.focus();

      // Tell the server your username
      socket.emit('add user', username);
    }
  }

  // Sends a chat message
  function sendMessage () {
    var message = $inputMessage.val();
    // Prevent markup from being injected into the message
    message = cleanInput(message);
    // if there is a non-empty message and a socket connection
    if (message && connected) {
      $inputMessage.val('');
      addChatMessage({
        username: username,
        message: message
      });
      // tell server to execute 'new message' and send along one parameter
      socket.emit('new C message', message);
    }
  }

  // Sends a SCORE message
  function sendScoreMessage () {
    var message = $scoreInputMessage.val();
    // Prevent markup from being injected into the message
    message = cleanInput(message);
    // if there is a non-empty message and a socket connection
    if (message && connected) {
      $scoreInputMessage.val('');
      addScoreMessage({
        username: $nextScoreMsg,
        message: message
      });
      addVoteMessage({
        username: $nextScoreMsg,
        message: message
      });
      var messageInfo = {
        username: $nextScoreMsg,
        message: message
      }

      // tell server to execute 'new message' and send along one parameter
      socket.emit('new S message', JSON.stringify({
        username: $nextScoreMsg,
        message: message
      }));
    }
  }

  // Log a message
  function log (message, options) {
    var $el = $('<li>').addClass('log').text(message);
    addMessageElement($el, options);
  }

  // Adds the visual chat message to the message list
  function addChatMessage (data, options) {
    /*
    // Don't fade the message in if there is an 'X was typing'
    var $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }
*/
    var $usernameDiv = $('<span class="username"/>')
      .text(data.username)
      .css('color', getUsernameColor(data.username));
    var $messageBodyDiv = $('<span class="messageBody">')
      .text(data.message);

    var typingClass = data.typing ? 'typing' : '';
    var $messageDiv = $('<li class="message"/>')
      .data('username', data.username)
      .addClass(typingClass)
      .append($usernameDiv, $messageBodyDiv);

    addMessageElement($messageDiv, options);
  }

  // Adds the visual Score message to the message list
  function addScoreMessage (data, options) {

    /*
    // Don't fade the message in if there is an 'X was typing'
    var $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }
*/
    var $usernameDiv = $('<span class="username"/>')
      .text(data.username)
      .css('color', getUsernameColor(data.username));
    var $scoreMessageBodyDiv = $('<span class="scoreMessageBody">')
      .text(data.message)

    var typingClass = data.typing ? 'typing S' : '';
    var $scoreMessageDiv = $('<li class="scoreMessage"/>')
      .data('username', data.username)
      .addClass(typingClass)
      .append($usernameDiv, $scoreMessageBodyDiv);
      console.log($scoreMessageDiv);

    addScoreMessageElement($scoreMessageDiv, options);
  }

  function addVoteMessage (data, options) {

    /*
    // Don't fade the message in if there is an 'X was typing'
    var $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }
*/
    var $usernameDiv = $('<span class="username"/>')
      .text(data.username)
      .css('color', getUsernameColor(data.username));
    var $voteMessageBodyDiv = $('<span class="voteMessage" id="voteMessages"/>')
      .text(data.message)
      //.append(" VOTE");

    var typingClass = data.typing ? 'typing S' : '';
    var $voteMessageDiv = $('<p class="voteMessages id="voteMessages"/>')
      .data('username', data.username)
      .addClass(typingClass)
      .append($usernameDiv, $voteMessageBodyDiv);

    $vote.text("VOTE");
    $vote.css('color', "orange");

      console.log($voteMessageDiv);

    addVoteMessageElement($voteMessageDiv, options);
  }

/*
  // Adds the visual chat typing message
  function addChatTyping (data) {
    data.typing = true;
    data.message = 'is typing';
    addChatMessage(data);
  }

  // Adds the visual score typing message
  function addScoreTyping (data) {
    data.typing = true;
    data.message = 'is typing';
    addScoreMessage(data);
  }


  // Removes the visual chat typing message
  function removeChatTyping (data) {
    getTypingMessages(data).fadeOut(function () {
      $(this).remove();
    });
  }

  // Removes the visual chat typing message
  function removeScoreTyping (data) {
    getTypingMessages(data).fadeOut(function () {
      $(this).remove();
    });
  }
*/

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  function addMessageElement (el, options) {
    var $el = $(el);

    // Setup default options
    if (!options) {
      options = {};
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }

    // Apply options
    if (options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
      $messages.prepend($el);
    } else {
      $messages.append($el);
    }
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }

  function addScoreMessageElement (el, options) {
    var $el = $(el);

    // Setup default options
    if (!options) {
      options = {};
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }

    // Apply options
    if (options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
      $scoreMessages.prepend($el);
    } else {
      $scoreMessages.append($el);
    }

    console.log($scoreMessages);

    $scoreMessages[0].scrollTop = $scoreMessages[0].scrollHeight;
  }

  function addVoteMessageElement (el, options) {
    var $el = $(el);

    if (!options) {
      options = {};
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }

    // Apply options
    if (options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
      $voteMessages.empty();
      $voteMessages.append($el);
    } else {
      $voteMessages.empty();
      $voteMessages.append($el);
    }

    console.log($voteMessages);
    //$voteMessages[0].scrollTop = $voteMessages[0].scrollHeight;


  }

  // Prevents input from having injected markup
  function cleanInput (input) {
    return $('<div/>').text(input).text();
  }

/*
  // Updates the typing event
  function updateTyping () {
    if (connected) {
      if (!typing) {
        typing = true;
        socket.emit('typing');
      }
      lastTypingTime = (new Date()).getTime();

      setTimeout(function () {
        var typingTimer = (new Date()).getTime();
        var timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
          socket.emit('stop typing');
          typing = false;
        }
      }, TYPING_TIMER_LENGTH);
    }
  }
*/
/*
  // Gets the 'X is typing' messages of a user
  function getTypingMessages (data) {
    return $('.typing.message').filter(function (i) {
      return $(this).data('username') === data.username;
    });
  }
*/
  // Gets the color of a username through our hash function
  function getUsernameColor (username) {
    // Compute hash code
    var hash = 7;
    for (var i = 0; i < username.length; i++) {
       hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }

  // Keyboard events

  $window.keydown(function (event) {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      //$currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if (username) {
        sendMessage();
        sendScoreMessage();
        socket.emit('stop typing');
        typing = false;
      } else {
        setUsername();
      }
    }
  });

/*
  $inputMessage.on('input', function() {
    updateTyping();
  });
*/
  // Click events

  // Focus input when clicking anywhere on login page
  $loginPage.click(function () {
    //$currentInput.focus();
  });

  // Focus input when clicking on the message input's border
  $inputMessage.click(function () {
    $inputMessage.focus();
  });

  $scoreInputMessage.click(function () {
    $scoreInputMessage.focus();
  });

  // Socket events

  // Whenever the server emits 'login', log the login message
  socket.on('login', function (data) {

    connected = true;

    // Display the welcome message
    var message = "Welcome to OFFAL Command Line – ";
    log(message, {
      prepend: true
    });

    data = JSON.parse(data);
    log(data.userList);

    addToDrop(data.userList);
    addParticipantsMessage(data.numUsers);
  });

  function addToDrop(data) {

    //data = JSON.parse(data);
    console.log(data);

    var menu = $('#timepass');

      menu.empty();
      $("<option />")
      .attr("value", "Choose Performer")
      .html("Choose Performer")
      .appendTo(menu);
      $("<option />")
      .attr("value", "ALL")
      .html("ALL")
      .appendTo(menu);

      //$.each(data.userList[value], function(){
      $.each(data, function(index, value){
          console.log(value)
          $("<option />")
          .attr("value", value)
          .html(value)
          .appendTo(menu);
      });
    //}).change();

  }


  socket.on('password option', function (data) {
    console.log("password received");
    passwordOpt = data;
    //console.log(passwordOpt);
  });

  // Whenever the server emits 'new message', update the chat body
  socket.on('new C message', function (data) {
    addChatMessage(data);
  });

  socket.on('new S message', function (data) {
    data = JSON.parse(data);
    addScoreMessage(data);
  });

  // Whenever the server emits 'user joined', log it in the chat body
  socket.on('user joined', function (data) {

    data = JSON.parse(data);

    log(data.username + ' joined');
    addToDrop(data.userList);
    addParticipantsMessage(data);
  });

  // Whenever the server emits 'user left', log it in the chat body
  socket.on('user left', function (data) {
    log(data.username + ' left');
    addParticipantsMessage(data);
    //removeChatTyping(data);
  });

/*
  // Whenever the server emits 'typing', show the typing message
  socket.on('typing', function (data) {
    addChatTyping(data);
  });

  socket.on('typing S', function (data) {
    addScoreTyping(data);
  });

  // Whenever the server emits 'stop typing', kill the typing message
  socket.on('stop typing', function (data) {


    removeChatTyping(data);
  });
  */

  $(document).ready(function(){
    $(".custom-select").each(function(){
        $(this).wrap( "<span class='select-wrapper'></span>" );
        $(this).after("<span class='holder'></span>");
    });
    $(".custom-select").change(function(){
        var selectedOption = $(this).find(":selected").text();
        $nextScoreMsg = selectedOption;
        $(this).next(".holder").text(selectedOption);
    }).trigger('change');
})

/*

<!DOCTYPE html>
<html>
<body>

<p id="demo" onclick="myFunction()">Click me to change my text color.</p>

<script>
function myFunction() {
    document.getElementById("demo").style.color = "red";
}
</script>

</body>
</html>

*/

});
