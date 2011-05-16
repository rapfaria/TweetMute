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
/*global window*/
var store = (function (window) {
  var namespace,
    localStorage,
    JSON,
    users;

  function isSupported() {
    return window.localStorage
      && window.JSON
      && window.JSON.parse
      && window.JSON.stringify;
  }

  function clear() {
    users = {};
    localStorage.setItem(namespace, "{}");
    //localStorage.clear();
  }

  function getUsersFromLocalStorage() {
    return JSON.parse(localStorage.getItem(namespace));
  }

  function setNamespace(name) {
    localStorage = window.localStorage;
    JSON = window.JSON;
    namespace = name;
    if (!localStorage.getItem(namespace)) {
      clear();
    } else {
      users = getUsersFromLocalStorage();
    }
  }

  function userExists(user) {//JSLint ain't happy
    return !!{}.hasOwnProperty.call(users, user);
  }

  function sortUsers(users) {
    var array = [],// = Object.keys(users)
      user;
    for (user in users) {
      if (userExists(user)) {
        array.push(user);
      }
      //jslint sucks: if({}.hasOwnProperty.call(users,user)){
      //        array.push(user);
      //      } gives an error.
    }
    array.sort();
    var result = {},
      l = array.length,
      i;
    for (i = 0; i < l; i++) {
      result[array[i]] = users[array[i]];
    }
    return result;
  }

  function saveUsersToLocalStorage(users) {
    users = sortUsers(users);
    localStorage.setItem(namespace, JSON.stringify(users));
  }

  function saveUser(user, retweet) {
    users[user] = !!retweet;
    saveUsersToLocalStorage(users);
  }

  function isEmpty() {
    return localStorage.getItem(namespace) === "{}";
  }

  function removeUser(user) {
    delete users[user];
    saveUsersToLocalStorage(users);
  }

  return {
    isSupported: isSupported,
    setNamespace: setNamespace,
    saveUser: saveUser,
    removeUser: removeUser,
    getUsers: getUsersFromLocalStorage,
    userExists: userExists,
    isEmpty:isEmpty,
    clear: clear
  };
}(window));