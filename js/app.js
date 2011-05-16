/*
 * Copyright (C) 2011 Raphael Pereira
 *
 * This file is part of TweetMute.
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License
 * for more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program. If not, see <http://www.gnu.org/licenses/>
 */

/*global $ setTimeout clearTimeout store twitterUtil*/
var tweetmute = {

  namespace: ":twtmtUsers",

  showMessage: (function () {
    var timeout = -1;
    return function (message) {
      clearTimeout(timeout);
      $("#message")
        .html(message)
        .show();
      timeout = setTimeout(function () {
        $("#message")
          .hide()
          .html("");
      }, 3000);
    };
  }()),

  formHandler: function () {
    var user = $("#username").val(),
      retweet = !!$(":checkbox:checked").val();

    user = twitterUtil.normalizeTwitterUsername(user);

    function defineMessage() {
      var msgs = {
        invalid: "# ain't a valid username.",
        alreadyMuted:"# is already silenced.",
        retweetsIncluded:"# was completely blocked.",
        muted:"From now on, no more # on your timeline."
      },
        msg,
        userMsg = "<strong>" + user + "</strong>";
      if (!twitterUtil.isValidUsername(user)) {
        if (!user)
          userMsg = "That";
        msg = msgs.invalid;
      } else
      if (store.userExists(user))
        if (retweet && !store.getUsers()[user])
          msg = msgs.retweetsIncluded;
        else
          msg = msgs.alreadyMuted;
      msg = msg || msgs.muted;
      return msg.replace("#", userMsg);
    }

    function saveUser() {
      if (twitterUtil.isValidUsername(user)) {
        store.saveUser(user, retweet);
      }
    }

    var msg = "<span>" + defineMessage() + "</span>";
    saveUser();
    tweetmute.showMessage(msg);
    tweetmute.reloadUI();
  },

  reloadUI: function () {
    tweetmute.loadMutedUsersAsDefinitionList();
    $(":checkbox")
      .attr("checked", false);
    $("#username")
      .val("")
      .focus();
  },

  loadMutedUsersAsDefinitionList: function () {
    if (store.isEmpty()) {
      return;
    }
    var users = store.getUsers();
    $("#usernames dd")
      .remove();
    $.each(users, function (user, retweet) {
      $("<dd>")
        .text(user)
        .addClass(retweet ? "blockretweet" : "")
        .appendTo("#usernames");
    });
  },

  init: function () {
    if (!store.isSupported()) {
      $("#content")
        .hide();
      var msg = "<h1>Seems like you are using a browser" +
        " that<br /> doesn't support TweetMute features." +
        "<br />Sorry.</h1>";
      $(msg)
        .addClass("error")
        .prependTo("body");
    } else {
      store.setNamespace(tweetmute.namespace);
    }

    //===========================================================
    //  bind event handlers
    //===========================================================

    $("#muteForm").keydown(function (event) {
      var ENTER_KEYCODE = 13;
      if (event.keyCode === ENTER_KEYCODE) {
        if ($(event.target).hasClass("clear")) {
          $("#clear")
            .trigger("click");
        } else {
          tweetmute.formHandler();
        }
        event.preventDefault();
        return false;
      }
    });

    $("#clear").click(function() {
      $("#usernames dd")
        .remove();
      store.clear();
    });

    $("#muteUser").click(function() {
      tweetmute.formHandler();
    });

    $("dd").live("click", function (e) {
      var $el = $(this);
      store.removeUser($el.text());
      $el
        .addClass("clicked")
        .slideUp("fast");
      e.preventDefault();
      return false;
    });

    $("dd").live("contextmenu", function(e) {

      if (!$(this).hasClass("empty")) {
        var user = $(this).text();
        store.saveUser(user, !store.getUsers()[user]);
        $(this).toggleClass("blockretweet");
      }

      return false;
    });
    
    tweetmute.loadMutedUsersAsDefinitionList();
  }
};