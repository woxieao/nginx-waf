const Mn = require("backbone.marionette");
const Cache = require("../cache");
const Controller = require("../controller");
const template = require("./main.ejs");
const TestView = require("./charts/qps/main.ejs");
const echarts = require("echarts");

module.exports = Mn.View.extend({
  template: template,
  id: "dashboard",
  columns: 0,

  stats: {},

  ui: {
    links: "a",
    test: ".test-item",
    test_div: ".test-div",
  },

  events: {
    "click @ui.links": function (e) {
      e.preventDefault();
      Controller.navigate($(e.currentTarget).attr("href"), true);
    },
    "click @ui.test": function (e) {
      e.preventDefault();
      window.echartsTest = echarts;
      console.log(document.getElementById("test_xa"));

      var myChart = echarts.init(document.getElementById("test_xa"));

      var myChart = echartsTest.init(document.getElementById("test_xa"));
      // 绘制图表
      myChart.setOption({
        title: {
          text: "ECharts 入门示例",
        },
        tooltip: {},
        xAxis: {
          data: ["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子"],
        },
        yAxis: {},
        series: [
          {
            name: "销量",
            type: "bar",
            data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
          },
        ],
      });
    },
  },
  test: () => {
    this.showChildView(
      "test_div",
      new TestView({
        test: "world",
      })
    );
  },
  templateContext: function () {
    return {
      getUserName: function () {
        return Cache.User.get("nickname") || Cache.User.get("name");
      },
    };
  },

  onRender: function () {
    let view = this;

    view.test();
  },

  /**
   * @param {Object}  [model]
   */
  preRender: function (model) {},

  initialize: function () {},
  onShow: (a) => {
    console.log("onShow", a);
  },
});
