'use strict';

function ExpressWidget(params) {
  var _this = this;

  var _ref = params || {};

  var containerId = _ref.containerId;
  var buttonStatus = _ref.buttonStatus;
  var elementId = _ref.elementId;
  var url = _ref.url;
  var chatId = _ref.chatId;
  var _ref$full = _ref.full;
  var full = _ref$full === undefined ? true : _ref$full;

  this.RPC_COMMAND = {
    UNREAD_CHATS_COUNTER: 'unreadChatsCounter',
    APP_LOADED: 'appLoaded',
    OPEN_CHAT: 'openChat',
    OPEN_CHAT_BY_USERNAME: 'openChatByUserName',
    VERSION: 'version',
    LOGOUT: 'logout',
    LOGIN: 'login'
  };
  this.containerElement = null;
  this.iframeElement = null;
  this.badgeElement = null;
  this.isOpen = false;
  this.isUser = false;

  this.init = function () {
    _this.containerElement = document.getElementById(elementId);
    if (!_this.containerElement) {
      var container = document.createElement('div');
      container.setAttribute('class', 'express-wrapper');
      container.setAttribute('id', elementId);
      document.body.appendChild(container);
      _this.containerElement = document.getElementById(elementId);
    } else {
      _this.containerElement.classList.add('express-wrapper');
    }

    var buttonId = 'express-button-' + Math.random();
    var iframeId = 'express-iframe-' + Math.random();
    var badgeId = 'express-bagde-' + Math.random();
    var containerIdElement = document.getElementById(containerId);
    if (containerId && containerIdElement) {
      containerIdElement.insertAdjacentHTML('beforeend',  '<iframe src="' + url + '/#/rpc?origin=' + encodeURIComponent(window.location.origin) + '" class="express-button-full express-iframe-full" sandbox="allow-downloads allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts allow-top-navigation-by-user-activation" id="' + iframeId + '"></iframe>');
    } else {
      document.body.insertAdjacentHTML('beforeend', '<iframe src="' + url + '/#/rpc?origin=' + encodeURIComponent(window.location.origin) + '" style="width: 1px; height: 1px; visibility: hidden;" class="express-iframe express-button-full" sandbox="allow-downloads allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts allow-top-navigation-by-user-activation" id="' + iframeId + '"></iframe>');
      _this.containerElement.innerHTML = '<button class="express-button" id="' + buttonId + '"><svg width="35" height="35" viewBox="-1 -1 16 16" fill="#FFF"><g fill="none" fill-rule="evenodd"><path fill="#FFF" d="M12.7 1H2.3c-.715 0-1.293.585-1.293 1.3L1 14l2.6-2.6h9.1c.715 0 1.3-.585 1.3-1.3V2.3c0-.715-.585-1.3-1.3-1.3zM3.6 5.55h7.8v1.3H3.6v-1.3zM8.8 8.8H3.6V7.5h5.2v1.3zm2.6-3.9H3.6V3.6h7.8v1.3z"></path></g></svg><span id=' + badgeId + ' class="express-button__badge" style="display:none"></span></button>';
    }

    _this.iframeElement = document.getElementById(iframeId);
    _this.badgeElement = document.getElementById(badgeId);
    _this.buttonElement = document.getElementById(buttonId);

    if (_this.buttonElement) {
      _this.buttonElement.addEventListener('click', _this.handleToggle);
    }
    window.addEventListener('message', function (event) {
      return _this.handleRpcCommand(event.data);
    });
  };

  this.handleRpcCommand = function (_ref2) {
    var type = _ref2.type;
    var payload = _ref2.payload;

    switch (type) {
      case _this.RPC_COMMAND.UNREAD_CHATS_COUNTER:
        if (_this.buttonElement) {
          _this.handleUnreadCounter(payload.counter);
        }
        break;
      case _this.RPC_COMMAND.APP_LOADED:
        if (!_this.isUser && payload) {
          _this.isUser = true;
          if (_this.buttonElement && buttonStatus) {
            _this.buttonElement.style = 'background-color: #4799e3;';
          }
        }
        if (full) _this.sendRpcCommand({ type: _this.RPC_COMMAND.VERSION, payload: { embeddedType: 'full' } });
        if (chatId) _this.sendRpcCommand({ type: _this.RPC_COMMAND.OPEN_CHAT, payload: { chatId: chatId } });
        break;
      case _this.RPC_COMMAND.LOGIN:
        if (!_this.isUser) {
          _this.isUser = true;
          if (_this.buttonElement && buttonStatus) {
            _this.buttonElement.style = 'background-color: #4799e3;';
          }
        }
        if (full) _this.sendRpcCommand({ type: _this.RPC_COMMAND.VERSION, payload: { embeddedType: 'full' } });
        break;
      case _this.RPC_COMMAND.LOGOUT:
        if (_this.isUser) {
          _this.isUser = false;
          if (_this.buttonElement && buttonStatus) {
            _this.buttonElement.style = 'background-color: #999999;';
          }
        }
        if (full) _this.sendRpcCommand({ type: _this.RPC_COMMAND.VERSION, payload: { embeddedType: 'full' } });
        if (_this.buttonElement) {
          _this.handleUnreadCounter(null);
        }
        break;
      case _this.RPC_COMMAND.VERSION:
        if (full) _this.sendRpcCommand({ type: _this.RPC_COMMAND.VERSION, payload: { embeddedType: 'full' } });
        break;
      case _this.RPC_COMMAND.OPEN_CHAT_BY_USERNAME:
        _this.sendRpcCommand({ type: _this.RPC_COMMAND.OPEN_CHAT_BY_USERNAME, payload: payload });
        break;
      default:
        break;
    }
  };

  this.sendRpcCommand = function (_ref3) {
    var type = _ref3.type;
    var payload = _ref3.payload;

    _this.iframeElement.contentWindow.postMessage({ type: type, payload: payload }, url);
  };

  this.handleUnreadCounter = function (counter) {
    if (!counter) {
      _this.badgeElement.style = 'display: none';
      return;
    }
    _this.badgeElement.style = '';
    _this.badgeElement.innerHTML = counter;
  };

  this.handleToggle = function () {
    if (_this.isOpen) {
      _this.handleClose();
    } else {
      _this.handleOpen();
    }
  };

  this.handleOpen = function () {
    if(!containerId) {
      _this.isOpen = true;
      _this.iframeElement.style = 'width: 50%; min-width: 600px; height: 50%; min-height: 600px; opacity: 1;';
    }
  };

  this.handleOpenChat = function (userName) {
    const [, chatIdApp] = String(userName).match(/([-0-9a-f]{36})/) || [];
    if (chatIdApp) _this.sendRpcCommand({ type: _this.RPC_COMMAND.OPEN_CHAT, payload: { chatId: chatIdApp } });
    if (userName && !chatIdApp) _this.handleRpcCommand({ type: _this.RPC_COMMAND.OPEN_CHAT_BY_USERNAME, payload: { userName: userName } });
    _this.handleOpen();
  };

  this.handleClose = function () {
    if(!containerId) {
      _this.isOpen = false;
      _this.iframeElement.style = 'width: 1px; height: 1px; min-width: 1px; min-height: 1px; opacity: 0;';
    }
  };

  this.handleOpenApp = function (data) {
    var browser = _this.checkBrowser();
    var url = 'expressapp://';
    const [, chatIdApp] = String(data).match(/([-0-9a-f]{36})/) || [];
    if (chatIdApp) url = 'expressapp://chats/' + chatIdApp;
    if (data && !chatIdApp) url = 'expressapp://adLogin/' + data;
    var success = false;

    function onBlur() {
      success = true;
    }
    if (browser.isFirefox) {
      _this.handleOpen();
      if (chatIdApp) _this.sendRpcCommand({ type: _this.RPC_COMMAND.OPEN_CHAT, payload: { chatId: chatIdApp } });
      if (data && !chatIdApp) _this.handleOpenChat(data);
    } else if (browser.isChrome) {
      const elem = document.body;

      elem.style = 'outline: 0;';
      elem.setAttribute('tabindex', '1');
      elem.focus();

      elem.addEventListener("blur", onBlur, true);

      location.href = url;

      setTimeout(function () {
        elem.removeEventListener('blur', onBlur, true);
        elem.removeAttribute('tabindex');
        if (!success) {
          _this.handleOpen();
          if (chatIdApp) _this.sendRpcCommand({ type: _this.RPC_COMMAND.OPEN_CHAT, payload: { chatId: chatIdApp } });
          if (data && !chatIdApp) _this.handleOpenChat(data);
        }
      }, 300);
    } else if (browser.isIE || browser.isSafari) {
      var iframe = document.querySelector('#hiddenIframe');
      if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.src = url;
        iframe.id = "hiddenIframe";
        iframe.style.display = "none";
        document.body.appendChild(iframe);
      }

      iframe.style = 'outline: 0;';
      iframe.setAttribute('tabindex', '1');
      iframe.focus();

      iframe.addEventListener("blur", onBlur, true);

      iframe.contentWindow.location.href = url;

      setTimeout(function () {
        iframe.removeEventListener('blur', onBlur, true);
        if (!success) {
          _this.handleOpen();
          if (chatIdApp) _this.sendRpcCommand({ type: _this.RPC_COMMAND.OPEN_CHAT, payload: { chatId: chatIdApp } });
          if (data && !chatIdApp) _this.handleOpenChat(data);
        }
      }, 300);
    } else {
      _this.handleOpen();
      if (chatIdApp) _this.sendRpcCommand({ type: _this.RPC_COMMAND.OPEN_CHAT, payload: { chatId: chatIdApp } });
      if (data && !chatIdApp) _this.handleOpenChat(data);
    }
  };


  this.checkBrowser = function() {
    var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    var ua = navigator.userAgent.toLowerCase();
    return {
      isOpera   : isOpera,
      isFirefox : typeof InstallTrigger !== 'undefined',
      isSafari  : (~ua.indexOf('safari') && !~ua.indexOf('chrome')) || Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0,
      isIOS     : /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
      isChrome  : !!window.chrome && !isOpera,
      isIE      : /*@cc_on!@*/false || !!document.documentMode // At least IE6
    }
  };

  this.init();
}
