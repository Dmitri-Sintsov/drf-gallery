'use strict';

define(
['text!/static/components/bs-form.html', 'dot', 'Vue', 'ViewModelMixin'],
function (htmlTemplate, dot, Vue, ViewModelMixin) {
    return Vue.component('bs-form', {
        template: htmlTemplate,
        mixins: [ViewModelMixin],
        props: ['url', 'form', 'fields', 'errors'],
        data: function() {
            // Modified props.
            return JSON.parse(JSON.stringify({
                form_: this.$props.form,
                errors_: this.$props.errors,
            }));
        },
        methods: {
            getInitialFields: function(v) {
                return {};
            },
            clearErrors: function() {
                this.$data.errors_ = this.getInitialFields([]);
            },
            error: function(response, data) {
                if (response.status === 400) {
                    // Display form errors bound to view model.
                    dot.keepArray = true;
                    dot.useArray = false;
                    var dotErrors = dot.dot(JSON.parse(JSON.stringify(response.body)));
                    var fieldErrors = $.extend(true, {}, this.getInitialFields([]), dotErrors)
                    this.$data.errors_ = fieldErrors;
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
                    var nestedData = dot.object(JSON.parse(JSON.stringify(data)));
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
