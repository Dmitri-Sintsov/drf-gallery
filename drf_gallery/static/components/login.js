'use strict';

import axios from '/static/js/vue/axios-esm.js';
import Vue from '/static/js/vue/vue.esm.browser.js';
import ViewModelMixin from '/static/components/viewmodel-mixin.js';

async function PromiseLogin() {
    var response = await axios.get('/static/components/login.html');
    var htmlTemplate = response.data;
    return Vue.component('signup', {
        template: htmlTemplate,
        store: document.getElementById('app').__vue__.$store,
        mixins: [ViewModelMixin],
        data: function() {
            return {
                /**
                 * Form fields (meta).
                 * The order is important.
                 */
                fields: [
                    {
                        name: 'email',
                        type: 'text',
                        label: 'Адрес электронной почты',
                    },
                    {
                        name: 'password',
                        type: 'password',
                        label: 'Пароль',
                    },
                ],
                // Form fields
                form: this.getInitialFields(),
                // Form errors
                errors: this.getInitialFields([]),
            };
        },
        methods: {
            getInitialFields: function(v) {
                if (v === undefined) {
                    v = '';
                }
                return {
                    email: v,
                    password: v,
                };
            },
            validate: function() {
                var form = this.$data.form;
                var errors = {};
                if (form.email === '') {
                    errors.email = ['email не должен быть пустым']
                }
                if (form.password === '') {
                    errors.password = ['Пароль не должен быть пустым'];
                }
                Vue.set(this.$data, 'errors', errors);
                return Object.keys(errors).length === 0;
            },
        },
    });
};

export default PromiseLogin;
