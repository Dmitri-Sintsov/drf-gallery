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
                this.$props.errors = this.getInitialFields([]);
            },
            error: function(response, data) {
                if (response.status === 400) {
                    // Display form errors bound to view model.
                    dot.keepArray = true;
                    dot.useArray = false;
                    var dotErrors = dot.dot(response.body);
                    var fieldErrors = $.extend(true, {}, this.getInitialFields([]), dotErrors)
                    this.$props.errors = fieldErrors;
                }
            },
            success: function(response, data) {
                // Clear form errors, if any.
                this.clearErrors();
            },
            submit: function(method, url, data, $event) {
                var self = this;
                if (this.$parent.validate(this)) {
                    dot.keepArray = true;
                    dot.useArray = false;
                    var nestedData = dot.object(data);
                    return this.$parent.submit.call(this, method, url, nestedData, $event).then(
                        function(response) {
                            if (response.status < 300) {
                                self.success(response, data);
                            } else {
                                self.error(response, data);
                            }
                            // return chained Promise result.
                            return response;
                        }
                    );
                }
            },
        }
    });
});
