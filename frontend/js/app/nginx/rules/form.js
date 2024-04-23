const Mn = require("backbone.marionette");
const App = require("../../main");
const RulesListModel = require("../../../models/rules-list");
const template = require("./form.ejs");

require("jquery-serializejson");

module.exports = Mn.View.extend({
  template: template,
  className: "modal-dialog",

  ui: {
    form: "form",
    buttons: ".modal-footer button",
    cancel: "button.cancel",
    save: "button.save",
    rules_add: "button.rules_add",
    le_error_info: "#le-error-info",
  },

  events: {
    "click @ui.save": function (e) {
      e.preventDefault();
      this.ui.le_error_info.hide();

      if (!this.ui.form[0].checkValidity()) {
        $('<input type="submit">')
          .hide()
          .appendTo(this.ui.form)
          .click()
          .remove();
        return;
      }

      let view = this;
      let form_data = this.ui.form.serializeJSON();

      let data = {
        name: form_data.name,
        description: form_data.description,
        sort: parseInt(form_data.sort, 10),
        block_type: form_data.block_type,
        lua_script: form_data.lua_script,
      };

      console.log(data);

      let method = App.Api.Nginx.RulesLists.create;
      let is_new = true;

      if (this.model.get("id")) {
        // edit
        is_new = false;
        method = App.Api.Nginx.RulesLists.update;
        data.id = this.model.get("id");
      }

      this.ui.buttons.prop("disabled", true).addClass("btn-disabled");
      method(data)
        .then((result) => {
          view.model.set(result);

          App.UI.closeModal(function () {
            if (is_new) {
              App.Controller.showWafRules();
            }
          });
        })
        .catch((err) => {
          this.ui.le_error_info[0].innerHTML = `${err.message}`;
          this.ui.le_error_info.show();
          this.ui.le_error_info[0].scrollIntoView();
          this.ui.buttons.prop("disabled", false).removeClass("btn-disabled");
        });
    },
  },

  onRender: function () {
    this.ui.le_error_info.hide();
  },

  initialize: function (options) {
    if (typeof options.model === "undefined" || !options.model) {
      this.model = new RulesListModel.Model();
    }
  },
});
