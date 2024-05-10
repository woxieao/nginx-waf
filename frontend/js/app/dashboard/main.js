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
    qps_div: ".qps-div",
  },
  regions: {
    qps_div: "@ui.qps_div",
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
              data: response.hostDict,
            })
          );
        }
      })
      .catch((err) => {
        console.log(err);
      });
  },

  showQps: function () {
    this.showChart("qps_div", this.counterLogFetch);
  },

  onRender: function () {
    this.refreshCharts();
  },
});
