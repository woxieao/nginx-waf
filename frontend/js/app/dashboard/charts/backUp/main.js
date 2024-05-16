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
    let data1 = this.getOption("data") || {};

    var data = {
      interceptedIdDict: { 1: 1, 4: 68, 5: 68, 7: 68, 6: 68 },
      interceptedNameDict: {
        cc拦截2: 68,
        sql拦截2: 68,
        cc拦截1: 68,
        sql拦截1: 68,
        url_demo: 1,
      },
      interceptedBlockTypeDict: {
        "cc-attack": 136,
        "sql-injection": 136,
        others: 1,
      },
      urlDict: {
        "http://debug-waf.xazrael.cn/account/30?cc=block2": 2,
        "http://debug-waf.xazrael.cn/account/29?cc=block1": 1,
        "http://debug-waf.xazrael.cn/account/33?cc=block2": 2,
        "http://debug-waf.xazrael.cn/account/12?cc=block1": 1,
        "http://debug-waf.xazrael.cn/account/42?cc=block1": 1,
        "http://debug-waf.xazrael.cn/account/40?cc=block1": 1,
        "http://debug-waf.xazrael.cn/account/14?cc=block1": 1,
        "http://debug-waf.xazrael.cn/account/32?cc=block1": 1,
        "http://debug-waf.xazrael.cn/account/64?cc=block2": 3,
        "http://debug-waf.xazrael.cn/account/17?cc=block1": 1,
        "http://debug-waf.xazrael.cn/account/9?cc=block2": 3,
        "http://debug-waf.xazrael.cn/account/2?cc=block1": 1,
        "http://debug-waf.xazrael.cn/account/26?sql=block1": 4,
        "http://debug-waf.xazrael.cn/account/68?cc=block2": 2,
        "http://debug-waf.xazrael.cn/account/94?sql=block1": 2,
        "http://debug-waf.xazrael.cn/account/50?sql=block1": 2,
        "http://debug-waf.xazrael.cn/account/64?sql=block1": 3,
        "http://debug-waf.xazrael.cn/account/89?sql=block1": 2,
        "http://debug-waf.xazrael.cn/account/33?sql=block1": 2,
        "http://debug-waf.xazrael.cn/account/68?sql=block1": 2,
        "http://debug-waf.xazrael.cn/account/26?sql=block2": 4,
        "http://debug-waf.xazrael.cn/account/94?sql=block2": 2,
        "http://debug-waf.xazrael.cn/account/22?sql=block2": 2,
        "http://debug-waf.xazrael.cn/account/50?sql=block2": 2,
        "http://debug-waf.xazrael.cn/account/35?sql=block2": 1,
        "http://debug-waf.xazrael.cn/account/33?sql=block2": 2,
        "http://debug-waf.xazrael.cn/account/23?sql=block2": 2,
        "http://debug-waf.xazrael.cn/account/22?cc=block1": 2,
        "http://debug-waf.xazrael.cn/account/24?cc=block1": 2,
        "http://debug-waf.xazrael.cn/account/94?cc=block1": 2,
        "http://debug-waf.xazrael.cn/account/33?cc=block1": 2,
        "http://debug-waf.xazrael.cn/account/23?cc=block1": 2,
        "http://debug-waf.xazrael.cn/account/22?cc=block2": 2,
        "http://debug-waf.xazrael.cn/account/50?cc=block1": 2,
        "http://debug-waf.xazrael.cn/account/24?cc=block2": 2,
        "http://debug-waf.xazrael.cn/account/64?cc=block1": 3,
        "http://debug-waf.xazrael.cn/account/87?cc=block1": 1,
        "http://debug-waf.xazrael.cn/account/23?cc=block2": 2,
        "http://debug-waf.xazrael.cn/account/97?cc=block1": 2,
        "http://debug-waf.xazrael.cn/account/53?sql=block1": 2,
        "http://debug-waf.xazrael.cn/account/83?cc=block2": 1,
        "http://debug-waf.xazrael.cn/account/9?sql=block1": 3,
        "http://debug-waf.xazrael.cn/account/66?sql=block1": 2,
        "http://debug-waf.xazrael.cn/account/53?sql=block2": 2,
        "http://debug-waf.xazrael.cn/account/26?cc=block2": 4,
        "http://debug-waf.xazrael.cn/account/87?cc=block2": 1,
        "http://debug-waf.xazrael.cn/account/68?sql=block2": 2,
        "http://debug-waf.xazrael.cn/account/77?cc=block2": 1,
        "http://debug-waf.xazrael.cn/account/68?cc=block1": 2,
        "http://debug-waf.xazrael.cn/account/86?cc=block2": 1,
        "http://debug-waf.xazrael.cn/account/78?sql=block1": 1,
        "http://debug-waf.xazrael.cn/account/14?sql=block2": 1,
        "http://debug-waf.xazrael.cn/account/13?sql=block2": 1,
        "http://debug-waf.xazrael.cn/account/2?sql=block2": 1,
        "http://debug-waf.xazrael.cn/account/85?cc=block2": 1,
        "http://debug-waf.xazrael.cn/account/8?cc=block1": 1,
        "http://debug-waf.xazrael.cn/account/sign-in?redirect_url=%2Fharbor%2Fprojects&test=block1": 2,
        "http://debug-waf.xazrael.cn/account/30?sql=block2": 2,
        "http://debug-waf.xazrael.cn/api/v2.0/users/current": 2,
        "http://debug-waf.xazrael.cn/account/13?cc=block1": 1,
        "http://debug-waf.xazrael.cn/account/8?sql=block2": 1,
        "http://debug-waf.xazrael.cn/account/22?sql=block1": 2,
        "http://debug-waf.xazrael.cn/account/34?cc=block1": 1,
        "http://debug-waf.xazrael.cn/account/3?sql=block2": 1,
        "http://debug-waf.xazrael.cn/account/66?sql=block2": 2,
        "http://debug-waf.xazrael.cn/account/23?sql=block1": 2,
        "http://debug-waf.xazrael.cn/account/9?sql=block2": 3,
        "http://debug-waf.xazrael.cn/api/v2.0/systeminfo": 2,
        "http://debug-waf.xazrael.cn/account/24?sql=block1": 2,
        "http://debug-waf.xazrael.cn/account/30?sql=block1": 2,
        "http://debug-waf.xazrael.cn/account/66?cc=block2": 2,
        "http://debug-waf.xazrael.cn/account/21?sql=block1": 4,
        "http://debug-waf.xazrael.cn/account/78?sql=block2": 1,
        "http://debug-waf.xazrael.cn/account/97?sql=block1": 2,
        "http://debug-waf.xazrael.cn/account/24?sql=block2": 2,
        "http://debug-waf.xazrael.cn/account/89?sql=block2": 2,
        "http://debug-waf.xazrael.cn/account/53?cc=block1": 2,
        "http://debug-waf.xazrael.cn/account/97?sql=block2": 2,
        "http://debug-waf.xazrael.cn/account/21?cc=block1": 4,
        "http://debug-waf.xazrael.cn/account/89?cc=block1": 2,
        "http://debug-waf.xazrael.cn/account/89?cc=block2": 2,
        "http://debug-waf.xazrael.cn/account/21?cc=block2": 4,
        "http://debug-waf.xazrael.cn/account/97?cc=block2": 2,
        "http://debug-waf.xazrael.cn/account/54?sql=block1": 2,
        "http://debug-waf.xazrael.cn/account/9?cc=block1": 3,
        "http://debug-waf.xazrael.cn/account/54?sql=block2": 2,
        "http://debug-waf.xazrael.cn/account/92?sql=block2": 3,
        "http://debug-waf.xazrael.cn/account/54?cc=block1": 2,
        "http://debug-waf.xazrael.cn/account/66?cc=block1": 2,
        "http://debug-waf.xazrael.cn/account/54?cc=block2": 2,
        "http://debug-waf.xazrael.cn/account/92?cc=block2": 3,
        "http://debug-waf.xazrael.cn/account/94?cc=block2": 2,
        "http://debug-waf.xazrael.cn/account/21?sql=block2": 4,
        "http://debug-waf.xazrael.cn/account/92?sql=block1": 3,
        "http://debug-waf.xazrael.cn/account/92?cc=block1": 3,
        "http://debug-waf.xazrael.cn/account/26?cc=block1": 4,
        "http://debug-waf.xazrael.cn/account/30?cc=block1": 2,
        "http://debug-waf.xazrael.cn/account/53?cc=block2": 2,
        "http://debug-waf.xazrael.cn/account/64?sql=block2": 3,
        "http://debug-waf.xazrael.cn/account/50?cc=block2": 2,
      },
      uaDict: {
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36": 7,
      },
      statusDict: { 401: 2, 403: 273, 200: 4 },
      hostDict: { "debug-waf.xazrael.cn": 279 },
      ipDict: { "114.242.33.6": 279 },
    };
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
    ).map(([name, value]) => ({ name: keyMap[name], value, selected: true }));

    console.log(interceptedNameDict,interceptedBlockTypeDict)
    option = option = {
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b}: {c} ({d}%)",
      },
      legend: {
        data: Object.values(keyMap),
      },
      series: [
        {
          name: "攻击类别",
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
            formatter: "{a|{a}}{abg|}\n{hr|}\n  {b|{b}：}{c}  {per|{d}%}  ",
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
