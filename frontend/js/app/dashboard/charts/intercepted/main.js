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
      "path-traversal": "目录遍历",
      "sensitive-path": "敏感目录",
      "cc-attack": "CC攻击",
      "malicious-file-upload": "恶意文件上传",
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
        subtext: "近24H",
        left: "center",
      },
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b}: {c} ({d}%)",
      },
      legend: {
        orient: "vertical",
        left: "right",
        data: Object.values(keyMap),
      },
      series: [
        {
          name: "拦截攻击类型",
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
          name: "命中规则名称",
          type: "pie",
          radius: ["45%", "60%"],
          labelLine: {
            length: 30,
          },
          label: {
            formatter: "{a|{b}}\n{hr|}\n {b|{c}次} {per|{d}%}  ",
            backgroundColor: "#F6F8FC",
            borderColor: "#8C8D8E",
            borderWidth: 1,
            borderRadius: 4,
            rich: {
              a: {
                color: "#6E7079",
                lineHeight: 22,
                align: "center",
              },
              hr: {
                borderColor: "#8C8D8E",
                width: "100%",
                borderWidth: 1,
                height: 0,
              },
              b: {
                color: "#4C5058",
                fontSize: 14,
                fontWeight: "bold",
                lineHeight: 33,
              },
              per: {
                color: "#fff",
                backgroundColor: "#4C5058",
                padding: [3, 4],
                borderRadius: 4,
              },
            },
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
