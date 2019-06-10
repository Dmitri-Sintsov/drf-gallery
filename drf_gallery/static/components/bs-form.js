'use strict';

define(
['text!/static/components/bs-form.html', 'dot', 'Vue', 'DatePick', 'ViewModelMixin'],
function (bsFormTemplate, dot, Vue, DatePick, ViewModelMixin) {
    document.body.insertAdjacentHTML('beforeend', bsFormTemplate);
    var bsFields = Vue.component('bs-field', {
        template: '#bs-field-template',
        components: {'date-pick': DatePick},
        props: ['def', 'val'],
        methods: {
            inputChange: function($event) {
                this.$emit('input-change', this.$props.def.name, $event.target.value);
            },
        }
    });
    var bsForm = Vue.component('bs-form', {
        template: '#bs-form-template',
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
            setInput: function(inputName, inputValue) {
                console.log(inputName);
                console.log(inputValue);
                this.$data.form_[inputName] = inputValue;
            },
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
                    var dotErrors = dot.dot(JSON.parse(JSON.stringify(response.data)));
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
