const Mn = require("backbone.marionette");
const App = require("../../../main");
const template = require("./item.ejs");

module.exports = Mn.View.extend({
  template: template,
  tagName: "tr",

  buildItemView: function (item, itemViewType, itemViewOptions) {
    var index = this.collection.indexOf(item);
    var options = _.extend({ model: item }, itemViewOptions, {
      $index: index,
    });
    var view = new itemViewType(options);
    return view;
  },
  ui: {
    edit: "a.edit",
    able: "a.able",
    delete: "a.delete",
    copy: "a.copy",
  },

  events: {
    "click @ui.edit": function (e) {
      e.preventDefault();
      App.Controller.showWafRulesListForm(this.model);
    },
    "click @ui.copy": function (e) {
      e.preventDefault();
      App.Controller.showWafRulesListForm(this.model, true);
    },
    "click @ui.able": function (e) {
      e.preventDefault();
      let id = this.model.get("id");
      App.Api.Nginx.RulesLists[
        this.model.get("enabled") ? "disable" : "enable"
      ](id).then(() => {
        return App.Api.Nginx.RulesLists.get(id).then((row) => {
          this.model.set(row);
        });
      });
    },
    "click @ui.delete": function (e) {
      e.preventDefault();
      App.Controller.showNginxRulesListDeleteConfirm(this.model);
    },
  },

  templateContext: { //
    canManage: App.Cache.User.canManage("rules_lists"),
  },

  initialize: function () {
    this.listenTo(this.model, "change", this.render);
  },
});
