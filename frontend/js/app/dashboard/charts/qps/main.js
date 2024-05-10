const Mn = require("backbone.marionette");
const template = require("./main.ejs");
const echarts = require("echarts");

module.exports = Mn.View.extend({
  tagName: "div",
  template: template,

  templateContext: function () {
    return { data1: this.getOption("data") };
  },
  data: {},

  onAttach: () => {
    console.log(1111111, this.data);

    window.echartsTest = echarts;

    var myChart = echartsTest.init(
      document.getElementsByClassName("echart-sm")[0]
    );
    myChart.setOption({
      title: {
        text: "近24H域名访问记录",
      },
      tooltip: {},
      xAxis: {
        data: Object.keys(this.data),
      },
      yAxis: {},
      series: [
        {
          name: "总请求数",
          type: "bar",
          data: Object.values(this.data),
        },
      ],
    });
  },
  onRender: function () {
    this.data = this.getOption("data") || {};
  },
});
