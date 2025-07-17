var L = Object.defineProperty;
var C = (e, t, n) =>
    t in e
        ? L(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n })
        : (e[t] = n);
var v = (e, t, n) => C(e, typeof t != "symbol" ? t + "" : t, n);
import "./style.js";
function O(e, t) {
    e.innerHTML = `${Math.floor(t)}`;
}
const k = "/practice/assets/abort.wav",
    x = "/practice/assets/autobegin.wav",
    I = "/practice/assets/autoend.wav",
    D = "/practice/assets/countdown.wav",
    N = "/practice/assets/endgame.wav",
    R = "/practice/assets/endmatch.wav",
    P = "/practice/assets/teleopbegin.wav",
    M = "/practice/assets/pickupcontrollers.wav",
    j = "/practice/assets/results.wav";
class A {
    constructor() {
        v(this, "audios", {});
    }
    preload() {
        (this.audios.abort = new Audio(k)),
            (this.audios.autobegin = new Audio(x)),
            (this.audios.autoend = new Audio(I)),
            (this.audios.countdown = new Audio(D)),
            (this.audios.endgame = new Audio(N)),
            (this.audios.endmatch = new Audio(R)),
            (this.audios.teleopbegin = new Audio(P)),
            (this.audios.pickupcontrollers = new Audio(M)),
            (this.audios.results = new Audio(j));
    }
    playSound(t) {
        this.audios[t] && this.audios[t].play();
    }
}
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */ var m =
    function (e, t) {
        return (
            (m =
                Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array &&
                    function (n, r) {
                        n.__proto__ = r;
                    }) ||
                function (n, r) {
                    for (var o in r) r.hasOwnProperty(o) && (n[o] = r[o]);
                }),
            m(e, t)
        );
    };
function E(e, t) {
    m(e, t);
    function n() {
        this.constructor = e;
    }
    e.prototype =
        t === null ? Object.create(t) : ((n.prototype = t.prototype), new n());
}
function G(e) {
    var t = typeof Symbol == "function" && e[Symbol.iterator],
        n = 0;
    return t
        ? t.call(e)
        : {
              next: function () {
                  return (
                      e && n >= e.length && (e = void 0),
                      { value: e && e[n++], done: !e }
                  );
              },
          };
}
function U(e, t) {
    var n = typeof Symbol == "function" && e[Symbol.iterator];
    if (!n) return e;
    var r = n.call(e),
        o,
        i = [],
        s;
    try {
        for (; (t === void 0 || t-- > 0) && !(o = r.next()).done; )
            i.push(o.value);
    } catch (a) {
        s = { error: a };
    } finally {
        try {
            o && !o.done && (n = r.return) && n.call(r);
        } finally {
            if (s) throw s.error;
        }
    }
    return i;
}
function W() {
    for (var e = [], t = 0; t < arguments.length; t++)
        e = e.concat(U(arguments[t]));
    return e;
}
var T = (function () {
        function e(t, n) {
            (this.target = n), (this.type = t);
        }
        return e;
    })(),
    F = (function (e) {
        E(t, e);
        function t(n, r) {
            var o = e.call(this, "error", r) || this;
            return (o.message = n.message), (o.error = n), o;
        }
        return t;
    })(T),
    q = (function (e) {
        E(t, e);
        function t(n, r, o) {
            n === void 0 && (n = 1e3), r === void 0 && (r = "");
            var i = e.call(this, "close", o) || this;
            return (i.wasClean = !0), (i.code = n), (i.reason = r), i;
        }
        return t;
    })(T);
/*!
 * Reconnecting WebSocket
 * by Pedro Ladaria <pedro.ladaria@gmail.com>
 * https://github.com/pladaria/reconnecting-websocket
 * License MIT
 */ var B = function () {
        if (typeof WebSocket < "u") return WebSocket;
    },
    Q = function (e) {
        return typeof e < "u" && !!e && e.CLOSING === 2;
    },
    l = {
        maxReconnectionDelay: 1e4,
        minReconnectionDelay: 1e3 + Math.random() * 4e3,
        minUptime: 5e3,
        reconnectionDelayGrowFactor: 1.3,
        connectionTimeout: 4e3,
        maxRetries: 1 / 0,
        maxEnqueuedMessages: 1 / 0,
    },
    $ = (function () {
        function e(t, n, r) {
            var o = this;
            r === void 0 && (r = {}),
                (this._listeners = {
                    error: [],
                    message: [],
                    open: [],
                    close: [],
                }),
                (this._retryCount = -1),
                (this._shouldReconnect = !0),
                (this._connectLock = !1),
                (this._binaryType = "blob"),
                (this._closeCalled = !1),
                (this._messageQueue = []),
                (this.onclose = null),
                (this.onerror = null),
                (this.onmessage = null),
                (this.onopen = null),
                (this._handleOpen = function (i) {
                    o._debug("open event");
                    var s = o._options.minUptime,
                        a = s === void 0 ? l.minUptime : s;
                    clearTimeout(o._connectTimeout),
                        (o._uptimeTimeout = setTimeout(function () {
                            return o._acceptOpen();
                        }, a)),
                        (o._ws.binaryType = o._binaryType),
                        o._messageQueue.forEach(function (c) {
                            return o._ws.send(c);
                        }),
                        (o._messageQueue = []),
                        o.onopen && o.onopen(i),
                        o._listeners.open.forEach(function (c) {
                            return o._callEventListener(i, c);
                        });
                }),
                (this._handleMessage = function (i) {
                    o._debug("message event"),
                        o.onmessage && o.onmessage(i),
                        o._listeners.message.forEach(function (s) {
                            return o._callEventListener(i, s);
                        });
                }),
                (this._handleError = function (i) {
                    o._debug("error event", i.message),
                        o._disconnect(
                            void 0,
                            i.message === "TIMEOUT" ? "timeout" : void 0
                        ),
                        o.onerror && o.onerror(i),
                        o._debug("exec error listeners"),
                        o._listeners.error.forEach(function (s) {
                            return o._callEventListener(i, s);
                        }),
                        o._connect();
                }),
                (this._handleClose = function (i) {
                    o._debug("close event"),
                        o._clearTimeouts(),
                        o._shouldReconnect && o._connect(),
                        o.onclose && o.onclose(i),
                        o._listeners.close.forEach(function (s) {
                            return o._callEventListener(i, s);
                        });
                }),
                (this._url = t),
                (this._protocols = n),
                (this._options = r),
                this._options.startClosed && (this._shouldReconnect = !1),
                this._connect();
        }
        return (
            Object.defineProperty(e, "CONNECTING", {
                get: function () {
                    return 0;
                },
                enumerable: !0,
                configurable: !0,
            }),
            Object.defineProperty(e, "OPEN", {
                get: function () {
                    return 1;
                },
                enumerable: !0,
                configurable: !0,
            }),
            Object.defineProperty(e, "CLOSING", {
                get: function () {
                    return 2;
                },
                enumerable: !0,
                configurable: !0,
            }),
            Object.defineProperty(e, "CLOSED", {
                get: function () {
                    return 3;
                },
                enumerable: !0,
                configurable: !0,
            }),
            Object.defineProperty(e.prototype, "CONNECTING", {
                get: function () {
                    return e.CONNECTING;
                },
                enumerable: !0,
                configurable: !0,
            }),
            Object.defineProperty(e.prototype, "OPEN", {
                get: function () {
                    return e.OPEN;
                },
                enumerable: !0,
                configurable: !0,
            }),
            Object.defineProperty(e.prototype, "CLOSING", {
                get: function () {
                    return e.CLOSING;
                },
                enumerable: !0,
                configurable: !0,
            }),
            Object.defineProperty(e.prototype, "CLOSED", {
                get: function () {
                    return e.CLOSED;
                },
                enumerable: !0,
                configurable: !0,
            }),
            Object.defineProperty(e.prototype, "binaryType", {
                get: function () {
                    return this._ws ? this._ws.binaryType : this._binaryType;
                },
                set: function (t) {
                    (this._binaryType = t),
                        this._ws && (this._ws.binaryType = t);
                },
                enumerable: !0,
                configurable: !0,
            }),
            Object.defineProperty(e.prototype, "retryCount", {
                get: function () {
                    return Math.max(this._retryCount, 0);
                },
                enumerable: !0,
                configurable: !0,
            }),
            Object.defineProperty(e.prototype, "bufferedAmount", {
                get: function () {
                    var t = this._messageQueue.reduce(function (n, r) {
                        return (
                            typeof r == "string"
                                ? (n += r.length)
                                : r instanceof Blob
                                ? (n += r.size)
                                : (n += r.byteLength),
                            n
                        );
                    }, 0);
                    return t + (this._ws ? this._ws.bufferedAmount : 0);
                },
                enumerable: !0,
                configurable: !0,
            }),
            Object.defineProperty(e.prototype, "extensions", {
                get: function () {
                    return this._ws ? this._ws.extensions : "";
                },
                enumerable: !0,
                configurable: !0,
            }),
            Object.defineProperty(e.prototype, "protocol", {
                get: function () {
                    return this._ws ? this._ws.protocol : "";
                },
                enumerable: !0,
                configurable: !0,
            }),
            Object.defineProperty(e.prototype, "readyState", {
                get: function () {
                    return this._ws
                        ? this._ws.readyState
                        : this._options.startClosed
                        ? e.CLOSED
                        : e.CONNECTING;
                },
                enumerable: !0,
                configurable: !0,
            }),
            Object.defineProperty(e.prototype, "url", {
                get: function () {
                    return this._ws ? this._ws.url : "";
                },
                enumerable: !0,
                configurable: !0,
            }),
            (e.prototype.close = function (t, n) {
                if (
                    (t === void 0 && (t = 1e3),
                    (this._closeCalled = !0),
                    (this._shouldReconnect = !1),
                    this._clearTimeouts(),
                    !this._ws)
                ) {
                    this._debug("close enqueued: no ws instance");
                    return;
                }
                if (this._ws.readyState === this.CLOSED) {
                    this._debug("close: already closed");
                    return;
                }
                this._ws.close(t, n);
            }),
            (e.prototype.reconnect = function (t, n) {
                (this._shouldReconnect = !0),
                    (this._closeCalled = !1),
                    (this._retryCount = -1),
                    !this._ws || this._ws.readyState === this.CLOSED
                        ? this._connect()
                        : (this._disconnect(t, n), this._connect());
            }),
            (e.prototype.send = function (t) {
                if (this._ws && this._ws.readyState === this.OPEN)
                    this._debug("send", t), this._ws.send(t);
                else {
                    var n = this._options.maxEnqueuedMessages,
                        r = n === void 0 ? l.maxEnqueuedMessages : n;
                    this._messageQueue.length < r &&
                        (this._debug("enqueue", t), this._messageQueue.push(t));
                }
            }),
            (e.prototype.addEventListener = function (t, n) {
                this._listeners[t] && this._listeners[t].push(n);
            }),
            (e.prototype.dispatchEvent = function (t) {
                var n,
                    r,
                    o = this._listeners[t.type];
                if (o)
                    try {
                        for (
                            var i = G(o), s = i.next();
                            !s.done;
                            s = i.next()
                        ) {
                            var a = s.value;
                            this._callEventListener(t, a);
                        }
                    } catch (c) {
                        n = { error: c };
                    } finally {
                        try {
                            s && !s.done && (r = i.return) && r.call(i);
                        } finally {
                            if (n) throw n.error;
                        }
                    }
                return !0;
            }),
            (e.prototype.removeEventListener = function (t, n) {
                this._listeners[t] &&
                    (this._listeners[t] = this._listeners[t].filter(function (
                        r
                    ) {
                        return r !== n;
                    }));
            }),
            (e.prototype._debug = function () {
                for (var t = [], n = 0; n < arguments.length; n++)
                    t[n] = arguments[n];
                this._options.debug &&
                    console.log.apply(console, W(["RWS>"], t));
            }),
            (e.prototype._getNextDelay = function () {
                var t = this._options,
                    n = t.reconnectionDelayGrowFactor,
                    r = n === void 0 ? l.reconnectionDelayGrowFactor : n,
                    o = t.minReconnectionDelay,
                    i = o === void 0 ? l.minReconnectionDelay : o,
                    s = t.maxReconnectionDelay,
                    a = s === void 0 ? l.maxReconnectionDelay : s,
                    c = 0;
                return (
                    this._retryCount > 0 &&
                        ((c = i * Math.pow(r, this._retryCount - 1)),
                        c > a && (c = a)),
                    this._debug("next delay", c),
                    c
                );
            }),
            (e.prototype._wait = function () {
                var t = this;
                return new Promise(function (n) {
                    setTimeout(n, t._getNextDelay());
                });
            }),
            (e.prototype._getNextUrl = function (t) {
                if (typeof t == "string") return Promise.resolve(t);
                if (typeof t == "function") {
                    var n = t();
                    if (typeof n == "string") return Promise.resolve(n);
                    if (n.then) return n;
                }
                throw Error("Invalid URL");
            }),
            (e.prototype._connect = function () {
                var t = this;
                if (!(this._connectLock || !this._shouldReconnect)) {
                    this._connectLock = !0;
                    var n = this._options,
                        r = n.maxRetries,
                        o = r === void 0 ? l.maxRetries : r,
                        i = n.connectionTimeout,
                        s = i === void 0 ? l.connectionTimeout : i,
                        a = n.WebSocket,
                        c = a === void 0 ? B() : a;
                    if (this._retryCount >= o) {
                        this._debug(
                            "max retries reached",
                            this._retryCount,
                            ">=",
                            o
                        );
                        return;
                    }
                    if (
                        (this._retryCount++,
                        this._debug("connect", this._retryCount),
                        this._removeListeners(),
                        !Q(c))
                    )
                        throw Error("No valid WebSocket class provided");
                    this._wait()
                        .then(function () {
                            return t._getNextUrl(t._url);
                        })
                        .then(function (_) {
                            t._closeCalled ||
                                (t._debug("connect", {
                                    url: _,
                                    protocols: t._protocols,
                                }),
                                (t._ws = t._protocols
                                    ? new c(_, t._protocols)
                                    : new c(_)),
                                (t._ws.binaryType = t._binaryType),
                                (t._connectLock = !1),
                                t._addListeners(),
                                (t._connectTimeout = setTimeout(function () {
                                    return t._handleTimeout();
                                }, s)));
                        });
                }
            }),
            (e.prototype._handleTimeout = function () {
                this._debug("timeout event"),
                    this._handleError(new F(Error("TIMEOUT"), this));
            }),
            (e.prototype._disconnect = function (t, n) {
                if (
                    (t === void 0 && (t = 1e3),
                    this._clearTimeouts(),
                    !!this._ws)
                ) {
                    this._removeListeners();
                    try {
                        this._ws.close(t, n),
                            this._handleClose(new q(t, n, this));
                    } catch {}
                }
            }),
            (e.prototype._acceptOpen = function () {
                this._debug("accept open"), (this._retryCount = 0);
            }),
            (e.prototype._callEventListener = function (t, n) {
                "handleEvent" in n ? n.handleEvent(t) : n(t);
            }),
            (e.prototype._removeListeners = function () {
                this._ws &&
                    (this._debug("removeListeners"),
                    this._ws.removeEventListener("open", this._handleOpen),
                    this._ws.removeEventListener("close", this._handleClose),
                    this._ws.removeEventListener(
                        "message",
                        this._handleMessage
                    ),
                    this._ws.removeEventListener("error", this._handleError));
            }),
            (e.prototype._addListeners = function () {
                this._ws &&
                    (this._debug("addListeners"),
                    this._ws.addEventListener("open", this._handleOpen),
                    this._ws.addEventListener("close", this._handleClose),
                    this._ws.addEventListener("message", this._handleMessage),
                    this._ws.addEventListener("error", this._handleError));
            }),
            (e.prototype._clearTimeouts = function () {
                clearTimeout(this._connectTimeout),
                    clearTimeout(this._uptimeTimeout);
            }),
            e
        );
    })();
function H() {
    return new $(`ws://${window.location.hostname}:8001`);
}
let d;
function h(e, t, n) {
    const r = Date.now(),
        o = (i) => {
            e.innerHTML = i;
        };
    clearInterval(d),
        (d = setInterval(() => {
            const i = Math.round((r - Date.now()) / 1e3) + t;
            i <= 0 && clearInterval(d);
            const s = g(i);
            o(s), n && n(i);
        }, 1e3)),
        o(`${g(t)}`);
}
function V() {
    clearInterval(d);
}
let f;
function z(e, t) {
    const n = Date.now(),
        r = (o) => {
            e.innerHTML = o;
        };
    (f = setInterval(() => {
        const o = +((Date.now() - n) / 1e3).toFixed(3);
        o >= 9999 && clearInterval(f), r(`${o}`);
    }, 1)),
        r(`${t.toFixed(3)}`);
}
function b(e) {
    clearInterval(f), z(e, 0);
}
function J() {
    clearInterval(f);
}
function g(e) {
    return (e - (e %= 60)) / 60 + (9 < e ? ":" : ":0") + e;
}
document.querySelector("#app").innerHTML = `
<nav>
	<a href="/practice">Timer</a>
	<a href="/practice/stats">Stats</a>
</nav>
<div id="timer-section">
	<div id="timer">2:30</div>
	<input type="text" id="input">
	<input type="submit" id="send">
</div>
<div id="bottom-section">
	<div id="changes-box">1</div>
	<div id="score-box">
		<div id="score">0</div>
	</div>
	<div id="cycle-time-box">
		<div id="cycle-timer">0.00</div>
	</div>
</div>
`;
const u = new A();
u.preload();
const p = document.getElementById("timer"),
    y = (e) => {
        switch (e) {
            case 120:
                u.playSound("autoend"), h(p, 8, K);
                break;
            case 30:
                u.playSound("endgame");
                break;
            case 0:
                u.playSound("endmatch");
                break;
        }
    },
    K = (e) => {
        switch (e) {
            case 6:
                u.playSound("pickupcontrollers");
                break;
            case 3:
                u.playSound("countdown");
                break;
            case 0:
                u.playSound("teleopbegin"), h(p, 120, y);
        }
    },
    w = document.getElementById("cycle-timer"),
    X = document.getElementById("score"),
    S = H();
S.onmessage = (e) => {
    let t;
    try {
        t = JSON.parse(e.data);
    } catch {
        console.error("Invalid socket message received");
        return;
    }
    Y(t);
};
const Y = (e) => {
    switch (e.event) {
        case "start":
            u.playSound("autobegin"), h(p, 150, y), b(w);
            break;
        case "abort":
            u.playSound("abort"), V(), J();
            break;
        case "resetTimer":
            h(p, 150, y);
            break;
        case "resetCycle":
            b(w);
            break;
        case "setScore":
            e.value && O(X, e.value);
            break;
        case "playSound":
            e.name && u.playSound(e.name);
            break;
        case "error":
            e.name
                ? console.error(`[SERVER] ${e.name}`)
                : console.error("[SERVER] An unknown error has occurred");
            break;
        default:
            console.error("Unknown event received");
            break;
    }
};
document.getElementById("send").addEventListener("click", () => {
    S.send(document.getElementById("input").value);
});
