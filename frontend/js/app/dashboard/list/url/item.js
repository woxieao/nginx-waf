const Mn = require("backbone.marionette");
const template = require("./item.ejs");

module.exports = Mn.View.extend({
  template: template,
  tagName: "tr",
  className:"log-row",
  ui: {},

  templateContext: {},
  initialize: function () {
    console.log(888888, this.model);
    this.listenTo(this.model, "change", this.render);
  },
});
