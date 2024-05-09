const Mn = require("backbone.marionette");
const Cache = require("../cache");
const template = require("./main.ejs");
const TestView = require("./charts/qps/main");
const App = require("../main");

module.exports = Mn.View.extend({
  template: template,
  id: "dashboard",

  ui: {
    links: "a",
    test: ".test-item",
    test_div: ".test-div",
  },
  regions: {
    test_div: "@ui.test_div",
  },
  events: {
    "click @ui.test": function (e) {
      e.preventDefault();

      let view = this;
      console.log(view);
      this.refreshCharts();
    },
  },
  refreshCharts: function () {
    this.showQps();
  },
  templateContext: function () {
    return {
      getUserName: function () {
        return Cache.User.get("nickname") || Cache.User.get("name");
      },
    };
  },

  initialize: function () {},
  onShow: (a) => {
    console.log("onShow", a);
  },
  fetch: App.Api.Waf.Log.test,
  showQps: function () {
    let view = this;
    view
      .fetch()
      .then((response) => {
        if (!view.isDestroyed()) {
          view.showChildView(
            "test_div",
            new TestView({
              data: JSON.stringify(response),
            })
          );
        }
      })
      .catch((err) => {
        view.showError(err);
      });
  },

  onRender: function () {
    this.refreshCharts();
  },
});
