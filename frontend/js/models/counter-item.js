const Backbone = require("backbone");

const model = Backbone.Model.extend({
  idAttribute: "id",

  defaults: function () {
    return {
      key: "",
      value: 0,
    };
  },
});

module.exports = {
  Model: model,
  Collection: Backbone.Collection.extend({
    model: model,
  }),
};
