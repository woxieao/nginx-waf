const Mn = require("backbone.marionette");
const template = require("./main.ejs");
const echarts = require("echarts");

module.exports = Mn.View.extend({
  tagName: "div",
  template: template,

  templateContext: function () {
    return { data1: this.getOption("data") };
  },

  onAttach: () => {
    
    console.log(-11111111111);
    console.log(this.data);
    console.log(this.getOption("data"));
    
    console.log(11111111111);
    window.echartsTest = echarts;
    let data = this.getOption("data") || {};

    var myChart = echartsTest.init(
      document.getElementsByClassName("echart-sm")[0]
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
  onRender: function () {

    console.log(22222);
    console.log(this.data);
    console.log(this.getOption("data"));

    console.log(33333);
  },
});
