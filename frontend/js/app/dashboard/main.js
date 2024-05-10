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
    test: ".test-btn",
    url_box: ".url-box",
  },
  regions: {
    url_box: "@ui.url_box",
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
    this.showUrlLog();
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
  counterLogFetch: App.Api.Waf.Log.counter_log,

  showChart: function (uiId, fetchFunc) {
    let view = this;
    fetchFunc()
      .then((response) => {
        console.log(22222,response);
        if (!view.isDestroyed()) {
          view.showChildView(
            uiId,
            new TestView({
              data: response.urlDict,
            })
          );
        }
      })
      .catch((err) => {
        console.log(err);
      });
  },

  showUrlLog: function () {
    this.showChart("url_box", this.counterLogFetch);
  },

  onRender: function () {
    this.refreshCharts();
  },
});
