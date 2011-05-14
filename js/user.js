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
/*global chrome window setInterval $*/
function userscript(usernames) {
  (function(version) {
    version = +version;
  }("0.21"));


  function isValidLocation() {
    var validLocations = {
      "http://twitter.com/#!/": 1,
      "http://twitter.com/": 1
    };
    return !!validLocations[window.location.href];
  }

  function removeTweets() {
    if (!isValidLocation()) {
      return;
    }
    function removeTweet($el) {
      var user = $el
        .find(".tweet-screen-name")
        .text()
        .toLowerCase();
      if ({}.hasOwnProperty.call(usernames, user)) {
        $el.remove();
        return true;
      }
      return false;
    }

    function removeRetweet($el) {
      var user = $el
        .find(".retweet-icon")
        .next()
        .text()
        .trim()
        .toLowerCase()
        .slice(3);
      if (usernames[user]) {
        $el.remove();
        return true;
      }
      return false;
    }

    function markAsVisited($el) {
      $el.addClass("twtmuted");
    }

    $(".stream-item:not(.twtmuted)").each(function () {

      var $el = $(this);
      if (!removeTweet($el) && !removeRetweet($el)) {
        markAsVisited($el);
      }
    });

  }

  function noUsers() {
    var user;
    for (user in usernames) {
      if ({}.hasOwnProperty.call(usernames, user)) {
        return false;
      }
    }
    return true;
  }

  $(function() {
    if (noUsers()) {
      return;
    }
    var $oldTwitter = $(".phoenix-old-version");
    if ($oldTwitter.length) {
      var msg = "TweetMute doesn't work on old Twitter. The time has come:";
      $oldTwitter.text(msg);
    } else {

      //initial load.
      var i;
      var delay = 100;
      var numDelays = 10;

      for (i = 1; i <= numDelays; i++) {
        (function(i) {
          setTimeout(function() {
            removeTweets();
          }, delay * i);
        }(i));
      }

      (function(){
        removeTweets();
        setTimeout(arguments.callee, 1000);
      })()

    }
  });

}

chrome.extension.sendRequest({
  action: "fetchUsers"
}, userscript);