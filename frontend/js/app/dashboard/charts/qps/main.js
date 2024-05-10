const Mn = require("backbone.marionette");
const echarts = require("echarts");

module.exports = Mn.View.extend({
  tagName: "div",
  template: '',

  templateContext: function () {
    return { data1: this.getOption("data") };
  },
  onRender: function () {
    let data = this.getOption("data") || {};
    window.echartsTest = echarts;
    var myChart = echartsTest.init(
      document.getElementsByClassName("url-box")[0]
    );
    myChart.setOption({
      title: {
        text: "热点Url(近24H)",
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
