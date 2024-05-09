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
    window.echartsTest = echarts;
    console.log(document.getElementById("test_xa"));
    var myChart = echarts.init(document.getElementById("test_xa"));
    var myChart = echartsTest.init(document.getElementById("test_xa"));
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
    this.data = "hello";
  },
});
