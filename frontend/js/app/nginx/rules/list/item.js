const Mn       = require('backbone.marionette');
const App      = require('../../../main');
const template = require('./item.ejs');

module.exports = Mn.View.extend({
    template: template,
    tagName:  'tr',

    ui: {
        edit:   'a.edit',
        delete: 'a.delete'
    },

    events: {
        'click @ui.edit': function (e) {
            e.preventDefault();
            App.Controller.showWafRulesListForm(this.model);
        },

        'click @ui.delete': function (e) {
            e.preventDefault();
            App.Controller.showNginxRulesListDeleteConfirm(this.model);
        }
    },

    templateContext: {
        canManage: App.Cache.User.canManage('rules_lists')
    },

    initialize: function () {
        this.listenTo(this.model, 'change', this.render);
    }
});
