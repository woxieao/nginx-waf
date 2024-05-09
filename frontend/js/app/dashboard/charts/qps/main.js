const Mn = require("backbone.marionette");
const template = require("./main.ejs");

module.exports = Mn.View.extend({
  tagName: "div",
  template: template,

  templateContext: {
    test: "default",
  },
  onRender: function () {
    this.test = "hello";
  },
});
