$(document).ready(function() {
  // Get references to Firebase data
  var ref = new Firebase("https://gdg-summit.firebaseio.com");
  var messagesRef = ref.child("messages");

  // Get references to DOM elements
  var $username = $("#username");
  var $newMessage = $("#newMessage");
  var $messageList = $("#messageList");
  var $loginButton = $("#loginButton");
  var $loggedInText = $("#loggedInText");
  var $logoutButton = $("#logoutButton");

  // Add a new message to the message list
  function addMessage(username, text) {
    var el = $("<li class='list-group-item'><b>" + username + ":</b> " + text + "</li>")
    $messageList.append(el);
  }

  // Loop through the last ten messages stored in Firebase
  messagesRef.limitToLast(10).on("child_added", function(snapshot) {
    var message = snapshot.val();

    // Escape unsafe characters
    var username = message.username.replace(/\</g, "&lt;").replace(/\>/g, "&gt;");
    var text = message.text.replace(/\</g, "&lt;").replace(/\>/g, "&gt;");

    addMessage(username, text);
  });

  // Listen for key presses on the new message input
  $newMessage.keypress(function (e) {
    // Get field values
    var username = $username.val();
    var text = $newMessage.val().trim();

    // Save message to Firebase when enter key is pressed
    if (e.keyCode == 13 && text.length) {
      messagesRef.push({
        username: "@" + globalAuthData.twitter.username,
        text: text
      }, function(error) {
        if (error) {
          console.log("Error adding new message:", error);
        }
      });

      // Reset new message input
      $newMessage.val("");
    }
  });

  // Listen for changes in auth state and show the appropriate buttons and messages
  var globalAuthData;
  ref.onAuth(function(authData) {
    globalAuthData = authData;

    if (authData) {
      // User logged in
      $loginButton.hide();
      $logoutButton.show();
      $loggedInText.text("Logged in as " + authData.twitter.displayName);
      $newMessage.prop("disabled", false);
    } else {
      // User logged out
      $loginButton.show();
      $logoutButton.hide();
      $loggedInText.text("");
      $newMessage.prop("disabled", true);
    }
  });

  // Login with Twitter when the login button is pressed
  $loginButton.click(function() {
    ref.authWithOAuthPopup("twitter", function(error, authData) {
      if (error) {
        console.error("Error authenticating with Twitter:", error);
      }
    });
  });

  // Logout when the logout button is pressed
  $logoutButton.click(function() {
    ref.unauth();
  });
});
