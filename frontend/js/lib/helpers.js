const numeral = require("numeral");
const moment = require("moment");

module.exports = {
  /**
   * @param   {Integer} number
   * @returns {String}
   */
  niceNumber: function (number) {
    return numeral(number).format("0,0");
  },

  /**
   * @param   {String|Number} date
   * @param   {String}        format
   * @returns {String}
   */
  formatDbDate: function (date, format) {
    if (typeof date === "number") {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    }

    return moment(date).format(format);
  },
  convertToChinaTime: function (utcDateStr) {
    const date = new Date(utcDateStr);

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds();

    const utcDate = new Date(
      Date.UTC(year, month - 1, day, hours, minutes, seconds)
    );

    utcDate.setHours(utcDate.getHours() + 8);

    const chinaYear = utcDate.getFullYear();
    const chinaMonth = String(utcDate.getMonth() + 1).padStart(2, "0");
    const chinaDay = String(utcDate.getDate()).padStart(2, "0");
    const chinaHours = String(utcDate.getHours()).padStart(2, "0");
    const chinaMinutes = String(utcDate.getMinutes()).padStart(2, "0");
    const chinaSeconds = String(utcDate.getSeconds()).padStart(2, "0");

    return `${chinaYear}-${chinaMonth}-${chinaDay} ${chinaHours}:${chinaMinutes}:${chinaSeconds}`;
  },
};
