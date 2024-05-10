const Mn = require("backbone.marionette");
const template = require("./main.ejs");
const echarts = require("echarts");

module.exports = Mn.View.extend({
  tagName: "div",
  template: template,

  templateContext: function () {
    return { data1: this.getOption("data") };
  },
  onRender: function () {
    let data = this.getOption("data") || {};
    window.echartsTest = echarts;
    var myChart = echartsTest.init(
      document.getElementsByClassName("qps-div")[0]
    );
    myChart.setOption({
      title: {
        text: "近24H域名访问记录",
      },
      tooltip: {},
      xAxis: {
        data: Object.keys(data),
      },
      yAxis: {},
      series: [
        {
          name: "总请求数",
          type: "bar",
          data: Object.values(data),
        },
      ],
    });
  },
});
