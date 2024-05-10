const Mn = require("backbone.marionette");
const template = require("./main.ejs");
const echarts = require("echarts");

module.exports = Mn.View.extend({
  tagName: "div",
  template: template,

  templateContext: function () {
    return { data: this.getOption("data") };
  },

  onShow: () => {
    this.data = "hello";
    window.echartsTest = echarts;
    console.log(66666, document.getElementsByClassName("echart-sm")[0]);
    var myChart = echartsTest.init(
      document.getElementsByClassName("echart-sm")[0]
    );
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
  onRender: function () {
    console.log(77777, document.getElementsByClassName("echart-sm")[0]);
    var myChart = echartsTest.init(
      document.getElementsByClassName("echart-sm")[0]
    );
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
});
