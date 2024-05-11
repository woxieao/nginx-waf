const Mn = require("backbone.marionette");
const echarts = require("echarts");
const template = require("./main.ejs");

module.exports = Mn.View.extend({
  tagName: "div",
  template: template,

  templateContext: function () {
    return { data1: this.getOption("data") };
  },
  onRender: function () {
    let data = this.getOption("data") || {};
    data = Object.entries(data).map(([name, value]) => ({ name, value }));

    option = {
      title: {
        text: '响应状态',
        left: 'center'
      },
      tooltip: {
        trigger: "item",
      },
      legend: { orient: "vertical", left: "right" },
      series: [
        {
          name: "状态码",
          type: "pie",
          radius: ["45%", "60%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: "#fff",
            borderWidth: 2,
          },
          label: {
            show: false,
            position: "center",
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 40,
              fontWeight: "bold",
            },
          },
          labelLine: {
            show: false,
          },
          data: data,
        },
      ],
    };

    window.echartsTest = echarts;
    var myChart = echartsTest.init(
      document.getElementsByClassName("status-box")[0]
    );
    myChart.setOption(option);
  },
});
