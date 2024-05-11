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
    var uaBrowserDict =Object.entries(data.uaBrowserDict).map(([name, value]) => ({
      name,
      value,
    }));

    
    var option = {
      tooltip: { trigger: "item" },
      series: [
        {
          name: "客户端",
          type: "pie",
          radius: ["30%", "45%"],
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
            // borderColor: "#fff",
          },
        },
        {
          name: "浏览器",
          type: "pie",
          radius: ["65%", "80%"],
          label: { show: false },
          itemStyle: {
            borderRadius: 2,
            borderWidth: 2,
            // borderColor: "#fff",
            //color: (ve) => colorList[ce.mode][4 - ve.dataIndex],
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
