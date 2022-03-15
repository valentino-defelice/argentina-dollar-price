const St = imports.gi.St;
const Main = imports.ui.main;
const Soup = imports.gi.Soup;
const Lang = imports.lang;
const Mainloop = imports.mainloop;
const Clutter = imports.gi.Clutter;
const PanelMenu = imports.ui.panelMenu;

let URL = "https://www.dolarsi.com/api/api.php?type=valoresprincipales";
let _httpSession;

const DolarIndicator = new Lang.Class({
  Name: 'DolarIndicator',
  Extends: PanelMenu.Button,

  _init: function () {
    this.parent(0.0, "Dolar Indicator", false);
    this.buttonText = new St.Label({
      text: _("Loading..."),
      y_align: Clutter.ActorAlign.CENTER
    });
    this.actor.add_actor(this.buttonText);
    this._refresh();
  },

  _refresh: function () {
    this._loadData(this._refreshUI);
    this._removeTimeout();
    this._timeout = Mainloop.timeout_add_seconds(900, Lang.bind(this, this._refresh));
    return true;
  },

  _loadData: function () {
    _httpSession = new Soup.Session();
    let message = Soup.Message.new('GET', URL);
    _httpSession.queue_message(message, Lang.bind(this, function (_httpSession, message) {
          if (message.status_code !== 200)
            return;
          let json = JSON.parse(message.response_body.data);
          this._refreshUI(json);
        }
      )
    );
  },

  _refreshUI: function (data) {
    let compra = data[1].casa.compra.toString();
    let venta = data[1].casa.venta.toString();
    txt = 'C: ' + compra.substring(0,6) + ' V: ' + venta.substring(0,6);
    global.log(txt);
    this.buttonText.set_text(txt);
  },

  _removeTimeout: function () {
    if (this._timeout) {
      Mainloop.source_remove(this._timeout);
      this._timeout = null;
    }
  },

  stop: function () {
    if (_httpSession !== undefined)
      _httpSession.abort();
    _httpSession = undefined;

    if (this._timeout)
      Mainloop.source_remove(this._timeout);
    this._timeout = undefined;

    this.menu.removeAll();
  }
});

let twMenu;

function init() {
}

function enable() {
	twMenu = new DolarIndicator;
	Main.panel.addToStatusArea('dolar-indicator', twMenu);
}

function disable() {
	twMenu.stop();
	twMenu.destroy();
}