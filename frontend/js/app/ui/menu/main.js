const $ = require("jquery");
const Mn = require("backbone.marionette");
const Controller = require("../../controller");
const Cache = require("../../cache");
const template = require("./main.ejs");
const App             = require('../../main');
module.exports = Mn.View.extend({
  id: "menu",
  className: "header collapse d-lg-flex p-0",
  template: template,

  ui: {
    links: "a",
  },

  events: {
    "click @ui.links": function (e) {
      let href = $(e.currentTarget).attr("href");
      if (href !== "#") {
        e.preventDefault();
        Controller.navigate(href, true);
      }
    },
  },

  templateContext: {
    isAdmin: function () {
      return Cache.User.isAdmin();
    },
    isWafUser: !Cache.User.isAdmin() && App.Cache.User.canManage("rules_lists"),
    canShow: function (perm) {
      return Cache.User.isAdmin() || Cache.User.canView(perm);
    },
  },

  initialize: function () {
    this.listenTo(Cache.User, "change", this.render);
  },
});
