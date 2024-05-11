const Mn = require("backbone.marionette");
const Cache = require("../cache");
const template = require("./main.ejs");
const StatusView = require("./charts/status/main");
const InterceptedView = require("./charts/intercepted/main");
const UaView = require("./charts/user-agent/main");

const CounterItemModel = require("../../models/counter-item");
const UrlView = require("./list/url/item");
const App = require("../main");

const UrlTableBody = Mn.CollectionView.extend({
  tagName: "tbody",
  className: "log-row",
  childView: UrlView,
});
module.exports = Mn.View.extend({
  template: template,
  id: "dashboard",

  ui: {
    links: "a",
    test: ".test-btn",
    status_box: ".status-box",
    intercepted_box: ".intercepted-box",
    ua_box: ".ua-box",
    ip_box: ".ip-box",
    url_box: ".url-box",
  },
  regions: {
    status_box: "@ui.status_box",
    intercepted_box: "@ui.intercepted_box",

    ip_box: "@ui.ip_box",

    url_box: { el: ".url-box", replaceElement: true },
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
          view.showUaLog({
            uaOsDict: response.uaOsDict,
            uaBrowserDict: response.uaBrowserDict,
          });
          view.showUrlLog(response.urlDict);
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

  showUaLog: function (data) {
    this.showChildView(
      "ua_box",
      new UaView({
        data: data,
      })
    );
  },

  showEmptyLog: function () {
    // let manage = App.Cache.User.canManage('access_lists');
    // this.showChildView('list_region', new EmptyView({
    //     title:      App.i18n('access-lists', 'empty'),
    //     subtitle:   App.i18n('all-hosts', 'empty-subtitle', {manage: manage}),
    //     link:       manage ? App.i18n('access-lists', 'add') : null,
    //     btn_color:  'teal',
    //     permission: 'access_lists',
    //     action:     function () {
    //         App.Controller.showNginxAccessListForm();
    //     }
    // }));
  },
  showUrlLog: function (data) {
    data = Object.entries(data).map(([name, value]) => ({
      key: name,
      value: value,
    }));
    console.log(7777777777, data, new CounterItemModel.Collection(data));
    this.showChildView(
      "url_box",
      new UrlTableBody({
        collection: new CounterItemModel.Collection(data),
      })
    );
  },

  onRender: function () {
    this.refreshCharts();
  },
});
