const Mn = require("backbone.marionette");
const template = require("./item.ejs");

module.exports = Mn.View.extend({
  template: template,
  tagName: "tr",
  ui: {},

  templateContext: {},
  initialize: function () {
    this.listenTo(this.model, "change", this.render);
  },
});
