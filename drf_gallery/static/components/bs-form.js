'use strict';

/**
 * https://vuejs.org/v2/guide/forms.html
 * text and textarea elements use value property and input event;
 * checkboxes and radiobuttons use checked property and change event;
 * select fields use value as a prop and change as an event.
 */

define(
['text!/static/components/bs-form.html', 'dot', 'Vue', 'DatePick', 'ViewModelMixin'],
function (bsFormTemplate, dot, Vue, DatePick, ViewModelMixin) {
    if (!document.getElementById('bs-form-template')) {
        document.body.insertAdjacentHTML('beforeend', bsFormTemplate);
    }
    var bsField = Vue.component('bs-field', {
        template: '#bs-field-template',
        components: {'date-pick': DatePick},
        props: ['def', 'val'],
        methods: {
            fieldChange: function($event) {
                // DatePick returns string $event with selected value.
                var value = (typeof $event !== 'object') ? $event : $event.target.value;
                this.$emit('field-change', this.$props.def.name, value);
            },
        }
    });
    var bsForm = Vue.component('bs-form', {
        template: '#bs-form-template',
        components: {'bs-field': bsField},
        mixins: [ViewModelMixin],
        props: ['url', 'form', 'fields', 'errors'],
        methods: {
            formFieldChange: function(inputName, inputValue) {
                console.log(inputName);
                console.log(inputValue);
                this.$emit('form-field-change', inputName, inputValue);
            },
            clearErrors: function() {
                this.$emit('form-errors', this.$parent.getInitialFields([]));
            },
            error: function(response, data) {
                if (response.status === 400) {
                    // Display form errors bound to view model.
                    dot.keepArray = true;
                    dot.useArray = false;
                    var dotErrors = dot.dot(JSON.parse(JSON.stringify(response.data)));
                    var fieldErrors = $.extend(true, {}, this.$parent.getInitialFields([]), dotErrors)
                    this.$emit('form-errors', fieldErrors);
                }
            },
            success: function(response, data) {
                // Clear form errors, if any.
                this.clearErrors();
            },
            submit: function(method, url, data, $event) {
                var self = this;
                if (typeof this.$parent.validate === 'function' && this.$parent.validate()) {
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
