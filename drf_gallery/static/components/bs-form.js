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
            error: function(response, data) {
                if (response.status === 400) {
                    // Display form errors bound to view model.
                    var dotErrors = dot.dot(response.body);
                    var fieldErrors = $.extend(true, {}, this.getInitialFields([]), dotErrors)
                    this.$data.errors = fieldErrors;
                }
            },
            success: function(response, data) {
                // Clear form errors, if any.
                this.clearErrors();
            },
            submit: function(method, url, data, $event) {
                if (this.$parent.validate(this)) {
                    var nestedData = dot.object(data);
                    return this.$parent.submit.call(this, method, url, nestedData, $event).then(
                        function(response) {
                            this.success(response, data);
                            // return chained Promise result.
                            return response;
                        },
                        function(response) {
                            this.error(response, data);
                            // return chained Promise result.
                            return response;
                        }
                    );
                }
            },
        }
    });
});
