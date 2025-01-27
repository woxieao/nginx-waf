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

    var keyMap = {
      "sql-injection": "SQL注入",
      xss: "跨站脚本攻击",
      "ip-policy": "IP访问控制",
      "malicious-crawlers":"恶意爬虫",
      "sensitive-path": "敏感目录",
      "cc-attack": "CC攻击",
      "malicious-file-upload": "恶意文件上传",
      "malicious-functions": "恶意函数执行",
      others: "其他",
    };

    var interceptedNameDict = Object.entries(data.interceptedNameDict).map(
      ([name, value]) => ({ name, value })
    );
    var interceptedBlockTypeDict = Object.entries(
      data.interceptedBlockTypeDict
    ).map(([name, value]) => ({ name: keyMap[name], value }));

    console.log(interceptedNameDict, interceptedBlockTypeDict);
    option = option = {
      title: {
        text: "拦截情况",
        left: "center",
      },
      tooltip: {
        trigger: "item",
      },
      legend: {
        orient: "vertical",
        left: "right",
        data: Object.values(keyMap),
      },
      series: [
        {
          name: "攻击类型",
          type: "pie",
          selectedMode: "single",
          radius: [0, "30%"],
          label: {
            position: "inner",
            fontSize: 14,
          },
          labelLine: {
            show: false,
          },
          data: interceptedBlockTypeDict,
        },
        {
          name: "规则名称",
          type: "pie",
          radius: ["45%", "60%"],
          labelLine: {
            length: 30,
          },
          label: {
            show: true,
          },

          data: interceptedNameDict,
        },
      ],
    };

    window.echartsTest = echarts;
    var myChart = echartsTest.init(
      document.getElementsByClassName("intercepted-box")[0]
    );
    myChart.setOption(option);
  },
});
