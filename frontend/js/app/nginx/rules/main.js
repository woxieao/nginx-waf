const Mn = require("backbone.marionette");
const App = require("../../main");
const RulesListModel = require("../../../models/rules-list");
const ListView = require("./list/main");
const ErrorView = require("../../error/main");
const EmptyView = require("../../empty/main");
const template = require("./main.ejs");

module.exports = Mn.View.extend({
  id: "nginx-rules",
  template: template,

  ui: {
    list_region: ".list-region",
    add: ".add-item",
    help: ".help",
    dimmer: ".dimmer",
    search: ".search-form",
    query: 'input[name="source-query"]',
  },

  showError: function (err) {
    this.showChildView(
      "list_region",
      new ErrorView({
        code: err.code,
        message: err.message,
        retry: function () {
          App.Controller.showWafRules();
        },
      })
    );

    console.error(err);
  },

  showEmpty: function () {
    let manage = App.Cache.User.canManage("rules_lists");

    this.showChildView(
      "list_region",
      new EmptyView({
        title: App.i18n("rules-lists", "empty"),
        subtitle: App.i18n("all-hosts", "empty-subtitle", { manage: manage }),
        link: manage ? App.i18n("rules-lists", "add") : null,
        btn_color: "teal",
        permission: "rules_lists",
        action: function () {
          App.Controller.showWafRulesListForm();
        },
      })
    );
  },

  regions: {
    list_region: "@ui.list_region",
  },

  events: {
    "click @ui.add": function (e) {
      e.preventDefault();
      App.Controller.showWafRulesListForm();
    },

    "click @ui.help": function (e) {
      e.preventDefault();
      App.Controller.showHelp(
        App.i18n("rules-lists", "help-title"),
        App.i18n("rules-lists", "help-content")
      );
    },

    "submit @ui.search": function (e) {
      e.preventDefault();

      let query = this.ui.query.val();

      this.fetch([],query)
        .then((response) => this.showData(response))
        .catch((err) => {
          this.showError(err);
        });
    },
  },

  templateContext: {
    showAddButton: App.Cache.User.canManage("rules_lists"),
  },

  fetch: App.Api.Nginx.RulesLists.getAll,
  showData: function (response) {
    this.showChildView(
      "list_region",
      new ListView({
        collection: new RulesListModel.Collection(response),
      })
    );
  },
  onRender: function () {
    let view = this;
    view
      .fetch()
      .then((response) => {
        if (!view.isDestroyed()) {
          if (response && response.length) {
            view.showData(response);
          } else {
            view.showEmpty();
          }
        }
      })
      .catch((err) => {
        view.showError(err);
      })
      .then(() => {
        view.ui.dimmer.removeClass("active");
      });
  },
});
