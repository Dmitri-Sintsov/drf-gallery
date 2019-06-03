'use strict';

define(
['text!/static/components/bs-form.html', 'dot', 'Vue', 'ViewModelMixin'],
function (htmlTemplate, dot, Vue, ViewModelMixin) {
    return Vue.component('bs-form', {
        template: htmlTemplate,
        mixins: [ViewModelMixin],
        props: ['url', 'form', 'fields', 'errors'],
        methods: {
            getInitialFields: function(v) {
                return {};
            },
            clearErrors: function() {
                this.$data.errors = this.getInitialFields([]);
            },
            validate: function(data) {
                console.log(JSON.stringify(data));
                return true;
            },
            error: function(response, data) {
                if (response.status === 400) {
                    // Display form errors bound to view model.
                    var dotErrors = dot.dot(response.body);
                    var fieldErrors = $.extend(true, {}, this.getInitialFields([]), dotErrors)
                    this.$data.errors = fieldErrors;
                    this.callViewModels(response);
                } else {
                    console.log(response);
                }
            },
            success: function(response, data) {
                console.log(response);
                // Clear form errors, if any.
                this.clearErrors();
                this.callViewModels(response);
            },
            submit: function(method, url, data, $event) {
                if (this.validate(data)) {
                    var nestedData = dot.object(data);
                    return ViewModelMixin.methods.submit.call(this, method, url, nestedData, $event);
                }
            },
        }
    });
});
