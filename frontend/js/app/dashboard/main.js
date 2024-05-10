const Mn = require("backbone.marionette");
const Cache = require("../cache");
const template = require("./main.ejs");
const StatusView = require("./charts/status/main");
const InterceptedView = require("./charts/intercepted/main");
const App = require("../main");

module.exports = Mn.View.extend({
  template: template,
  id: "dashboard",

  ui: {
    links: "a",
    test: ".test-btn",
    status_box: ".status-box",
    intercepted_box: ".intercepted-box",
  },
  regions: {
    status_box: "@ui.status_box",
    intercepted_box: "@ui.intercepted_box",
  },
  events: {
    "click @ui.test": function (e) {
      e.preventDefault();
      this.refreshCharts();
    },
  },
  refreshCharts: function () {
    let view = this;
    view
      .counterLogFetch()
      .then((response) => {
        if (!view.isDestroyed()) {
          view.showInterceptedLog({
            interceptedNameDict: response.interceptedNameDict,
            interceptedBlockTypeDict: response.interceptedBlockTypeDict,
          });
          view.showStatusLog(response.statusDict);
        }
      })
      .catch((err) => {
        console.log(err);
      });
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

  showStatusLog: function (data) {
    this.showChildView(
      "status_box",
      new StatusView({
        data: data,
      })
    );
  },
  showInterceptedLog: function (data) {
    this.showChildView(
      "intercepted_box",
      new InterceptedView({
        data: data,
      })
    );
  },

  onRender: function () {
    this.refreshCharts();
  },
});
