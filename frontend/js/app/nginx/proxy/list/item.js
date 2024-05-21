const Mn = require("backbone.marionette");
const App = require("../../../main");
const template = require("./item.ejs");

module.exports = Mn.View.extend({
  template: template,
  tagName: "tr",

  ui: {
    able: "a.able",
    edit: "a.edit",
    delete: "a.delete",
    host_link: ".host-link",
    block_exploits_switch: ".block_exploits_switch",
    anti_ddos_switch: ".anti_ddos_switch",
  },

  events: {
    "click @ui.able": function (e) {
      e.preventDefault();
      let id = this.model.get("id");
      App.Api.Nginx.ProxyHosts[
        this.model.get("enabled") ? "disable" : "enable"
      ](id).then(() => {
        return App.Api.Nginx.ProxyHosts.get(id).then((row) => {
          this.model.set(row);
        });
      });
    },

    "click @ui.edit": function (e) {
      e.preventDefault();
      App.Controller.showNginxProxyForm(this.model);
    },

    "click @ui.delete": function (e) {
      e.preventDefault();
      App.Controller.showNginxProxyDeleteConfirm(this.model);
    },

    "click @ui.host_link": function (e) {
      e.preventDefault();
      let win = window.open($(e.currentTarget).attr("rel"), "_blank");
      win.focus();
    },
    "click @ui.block_exploits_switch": function (e) {
      e.preventDefault();
      let id = this.model.get("id");
      App.Api.Nginx.ProxyHosts[
        "block_exploits_" +
          (this.model.get("block_exploits") ? "disable" : "enable")
      ](id).then(() => {
        return App.Api.Nginx.ProxyHosts.get(id).then((row) => {
          this.model.set(row);
        });
      });
    },

    "click @ui.anti_ddos_switch": function (e) {
      e.preventDefault();
      let id = this.model.get("id");
      App.Api.Nginx.ProxyHosts[
        "anti_ddos_" +
          (this.model.get("anti_ddos") ? "disable" : "enable")
      ](id).then(() => {
        return App.Api.Nginx.ProxyHosts.get(id).then((row) => {
          this.model.set(row);
        });
      });
    },
  },

  templateContext: {
    canManage: App.Cache.User.canManage("proxy_hosts"),
    canManageWaf: App.Cache.User.canManage("rules_lists"),

    isOnline: function () {
      return typeof this.meta.nginx_online === "undefined"
        ? null
        : this.meta.nginx_online;
    },

    getOfflineError: function () {
      return this.meta.nginx_err || "";
    },
  },

  initialize: function () {
    this.listenTo(this.model, "change", this.render);
  },
});
