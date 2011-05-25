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
/*global chrome window setTimeout $*/
function userscript(usernames) {
  (function(version) {
    version = +version;
  }("0.300"));


  function isValidLocation() {
    var validLocations = {
      "http://twitter.com/#!/": 1,
      "http://twitter.com/": 1
    };
    return !!validLocations[window.location.href];
  }

  function removeTweets() {

    if (isValidLocation()) {

      $(document).bind("DOMNodeInserted", function(e) {
        var $el = $(e.target);
        if (isTweet($el)) {
          if (tweetUsernameIsBlocked($el) || retweetUsernameIsBlocked($el)) {
            $el.hide();
          }
        }
      });
    }

    function isTweet($el) {
      return $($el).hasClass("stream-item");
    }

    function tweetUsernameIsBlocked($el) {
      var user = $el
        .find(".tweet-screen-name")
        .text()
        .toLowerCase();
      return {}.hasOwnProperty.call(usernames, user);
    }

    function retweetUsernameIsBlocked($el) {
      var user = $el
        .find(".retweet-icon")
        .next()
        .text()
        .trim()
        .toLowerCase()
        .slice(3);
      return usernames[user];
    }

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

  function handleOldTwitter() {
    var $oldTwitter = $(".phoenix-old-version");
    if ($oldTwitter.length) {
      var msg = "TweetMute doesn't work on old Twitter. The time has come:";
      $oldTwitter.text(msg);
      return false;
    }
    return true;
  }

  function init() {
    if (noUsers()) {
      return;
    }
    handleOldTwitter() && removeTweets();
  }

  $(init);

}

chrome.extension.sendRequest({
  action: "fetchUsers"
}, userscript);


