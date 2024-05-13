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

    var uaOsDict = Object.entries(data.uaOsDict).map(([name, value]) => ({
      name,
      value,
    }));
    var uaBrowserDict = Object.entries(data.uaBrowserDict).map(
      ([name, value]) => ({
        name,
        value,
      })
    );

    var option = {
      title: {
        text: "客户端", 
        left: "center",
      },
      legend: [
        {
          orient: "vertical",
          left: "right",
          data: Object.keys(data.uaBrowserDict),
        },
      ],
      tooltip: { trigger: "item" },
      series: [
        {
          name: "客户端",
          type: "pie",
          radius: ["20%", "35%"],
          label: { position: "inner", fontSize: 14 },
          labelLine: { show: false },
          data: uaOsDict,
          tooltip: {
            formatter: (ve) => `客户端(${ve.data.name}): ${ve.data.value}`,
          },
          minAngle: 10,
          minShowLabelAngle: 1,
          itemStyle: {
            borderRadius: 2,
            borderWidth: 2,
            color: function (colors) {
              var colorList = [
                "#dd6b66",
                "#759aa0",
                "#e69d87",
                "#8dc1a9",
                "#ea7e53",
                "#eedd78",
                "#73a373",
                "#73b9bc",
                "#7289ab",
                "#91ca8c",
                "#f49f42", 
              ];
              return colorList[colors.dataIndex];
            },
          },
        },
        {
          name: "浏览器",
          type: "pie",
          radius: ["45%", "60%"],
          label: { show: false },
          itemStyle: {
            borderRadius: 2,
            borderWidth: 2,
            color: function (colors) {
              var colorList = [
                "#37A2DA",
                "#32C5E9",
                "#67E0E3",
                "#9FE6B8",
                "#FFDB5C",
                "#ff9f7f",
                "#fb7293",
                "#E062AE",
                "#E690D1",
                "#e7bcf3",
                "#9d96f5",
                "#8378EA",
                "#96BFFF",
              ];
              return colorList[colors.dataIndex];
            },
          },
          data: uaBrowserDict,
          minAngle: 10,
          minShowLabelAngle: 1,
          tooltip: {
            formatter: (ve) => `浏览器(${ve.data.name}): ${ve.data.value}`,
          },
        },
      ],
    };

    window.echartsTest = echarts;
    var myChart = echartsTest.init(
      document.getElementsByClassName("ua-box")[0]
    );
    myChart.setOption(option);
  },
});
