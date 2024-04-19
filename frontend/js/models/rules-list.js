const Backbone = require("backbone");

const model = Backbone.Model.extend({
  idAttribute: "id",

  defaults: function () {
    return {
      id: undefined,
      created_on: null,
      modified_on: null,
      name: "",
      description: "",
      enabled: true,
      sort: 1,
      block_type: "others",
      lua_script: "",
      block_counter: 0,
    };
  },
});

module.exports = {
  Model: model,
  Collection: Backbone.Collection.extend({
    model: model,
  }),
};
