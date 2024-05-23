const $ = require("jquery");
const Mn = require("backbone.marionette");
const template = require("./login.ejs");
const Api = require("../../app/api");
const i18n = require("../../app/i18n");
const Tokens = require("../../app/tokens");

module.exports = Mn.View.extend({
  template: template,
  className: "page-single",

  ui: {
    form: "form",
    identity: 'input[name="identity"]',
    secret: 'input[name="secret"]',
    error: ".secret-error",
    button: "button",
  },

  events: {
    "submit @ui.form": function (e) {
      e.preventDefault();
      this.ui.button.addClass("btn-loading").prop("disabled", true);
      this.ui.error.hide();

      Api.Tokens.login(this.ui.identity.val(), this.ui.secret.val(), true)
        .then(() => {
          window.location = "/";
        })
        .catch((err) => {
          this.ui.error.text(err.message).show();
          this.ui.button.removeClass("btn-loading").prop("disabled", false);
        });
    },
  },
  initialize: function () {
    var token =
      new URL(location.href).searchParams.get("third_login_token") || "";
    if (token) {      
      Tokens.addToken(token);
      window.location = "/";
    }
  },
  templateContext: {
    i18n: i18n,
    identity: atob(new URL(location.href).searchParams.get("identity") || ""),
    secret: atob(new URL(location.href).searchParams.get("secret") || ""),
    getVersion: function () {
      return "v1.0.1";
    },
  },
});
