const $ = require("jquery");
const Mn = require("backbone.marionette");
const template = require("./login.ejs");
const Api = require("../../app/api");
const i18n = require("../../app/i18n");

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
  parseQueryString: function (queryString) {
    var params = {};
    if (queryString) {
      _.each(
        _.map(decodeURI(queryString).split(/&/g), function (el, i) {
          var aux = el.split("="),
            o = {};
          if (aux.length >= 1) {
            var val = undefined;
            if (aux.length == 2) val = aux[1];
            o[aux[0]] = val;
          }
          return o;
        }),
        function (o) {
          _.extend(params, o);
        }
      );
    }
    return params;
  },
  templateContext: {
    i18n: i18n,
    identity: this.parseQueryString(window.location.href).identity,
    secret: this.parseQueryString(window.location.href).secret,
    getVersion: function () {
      return $("#login").data("version");
    },
  },
});
