const Mn = require("backbone.marionette");
const template = require("./main.ejs");
const echarts = require("echarts");

module.exports = Mn.View.extend({
  tagName: "div",
  template: template,

  templateContext: function () {
    return { data: this.getOption("data") };
  },

  onAttach: () => {
    window.echartsTest = echarts;
    let view = this;
    console.log(this.data);
    var myChart = echartsTest.init(
      document.getElementsByClassName("echart-sm")[0]
    );
    myChart.setOption({
      title: {
        text: "近24H域名访问记录",
      },
      tooltip: {},
      xAxis: {
        data: Object.keys(view.data),
      },
      yAxis: {},
      series: [
        {
          name: "总请求数",
          type: "bar",
          data: Object.values(view.data),
        },
      ],
    });
  },
  onRender: function () {},
});
