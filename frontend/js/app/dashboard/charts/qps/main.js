const Mn = require("backbone.marionette");
const template = require("./main.ejs");

module.exports = Mn.View.extend({
  tagName: "div",
  template: template,

  templateContext: function () {
    return { test: this.getOption("test") };
  },
  onRender: function () {
    this.test = "hello";
  },
});
