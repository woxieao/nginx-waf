const Mn = require("backbone.marionette");
const Cache = require("../cache");
const Controller = require("../controller");
const template = require("./main.ejs");
const echarts = require("echarts");

module.exports = Mn.View.extend({
  template: template,
  id: "dashboard",
  columns: 0,

  stats: {},

  ui: {
    links: "a",
    test: ".test-item",
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

      // 绘制图表
      myChart.setOption({
        title: {
          text: "ECharts 入门示例",
        },
        grid: { top: 10, bottom: 10, right: 0, left: 0 },
        tooltip: {},
        xAxis: {
          type: "category",
          data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          axisTick: { show: false },
          show: false,
        },
        yAxis: {
          show: false,
          type: "value",
          splitLine: { lineStyle: { type: "dashed" }, show: false },
        },
        series: [
          {
            name: "QPS",
            type: "bar",
            barGap: "0",
            barMinHeight: 4,
            emphasis: {},
            itemStyle: { borderRadius: [2, 2, 0, 0] },
          },
        ],
      });
    },
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
  },

  /**
   * @param {Object}  [model]
   */
  preRender: function (model) {},

  initialize: function () {},
  onShow: (a) => {
    console.log(a);

    console.log(document.getElementById("test_xa"));
    // 基于准备好的dom，初始化echarts实例
  },
});
