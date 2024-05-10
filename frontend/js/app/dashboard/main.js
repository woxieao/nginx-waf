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
    status_box: ".status-box",
  },
  regions: {
    status_box: "@ui.status_box",
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
    this.showStatusLog();
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
        if (!view.isDestroyed()) {
          view.showChildView(
            uiId,
            new TestView({
              data: response.statusDict,
            })
          );
        }
      })
      .catch((err) => {
        console.log(err);
      });
  },

  showStatusLog: function () {
    this.showChart("status_box", this.counterLogFetch);
  },

  onRender: function () {
    this.refreshCharts();
  },
});
