'use strict';

import axios from '/static/js/vue/axios-esm.js';
import Vue from '/static/js/vue/vue.esm.browser.js';
import ViewModelMixin from '/static/components/viewmodel-mixin.js';

async function PromiseSignup() {
    var response = await axios.get('/static/components/signup.html');
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
                    /*
                    {
                        name: 'first_name',
                        type: 'text',
                        label: 'Имя',
                    },
                    {
                        name: 'last_name',
                        type: 'text',
                        label: 'Фамилия',
                    },
                    {
                        name: 'profile.patronymic',
                        type: 'text',
                        label: 'Отчество',
                    },
                    {
                        name: 'profile.birth_date',
                        type: 'date',
                        format: 'YYYY-MM-DD',
                        label: 'День рождения',
                    },
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
                    {
                        name: 'password2',
                        type: 'password',
                        label: 'Пароль (повторно)',
                    },
                    {
                        name: 'profile.eye_color.title',
                        type: 'select',
                        label: 'Цвет глаз',
                        options: [],
                    },
                    {
                        name: 'profile.birth_country.title',
                        type: 'select',
                        label: 'Страна рождения',
                        options: [],
                    },
                    */
                ],
                // Form data
                form: this.getInitialFields(),
                // Form errors
                errors: this.getInitialFields([]),
            };
        },
        created: function() {
            var self = this;
            // axios changes this context.
            this.post('/users/get_fields/').then(function(response) {
                for (var i = 0; i < response.data.length; i++) {
                    var field = response.data[i];
                    if (field.name === 'password') {
                        response.data.splice(i + 1, 0, {
                            name: 'password2',
                            type: 'password',
                            label: 'Пароль (повторно)',
                        });
                        break;
                    }
                }
                self.$data.fields = response.data;
            });
        },
        methods: {
            getInitialFields: function(v) {
                if (v === undefined) {
                    v = '';
                }
                return {
                    first_name: v,
                    last_name: v,
                    email: v,
                    password: v,
                    password2: v,
                    'profile.patronymic': v,
                    'profile.birth_date': v,
                    'profile.eye_color.title': v,
                    'profile.birth_country.title': v,
                };
            },
            validate: function() {
                var errors = [];
                var form = this.$data.form;
                if (form.password !== form.password2) {
                    errors.push('Пароли должны совпадать');
                } else if (form.password === '') {
                    errors.push('Пароль не должен быть пустым');
                }
                Vue.set(this.$data.errors, 'password', errors);
                Vue.set(this.$data.errors, 'password2', errors);
                return errors.length === 0;
            },
        },
    });
};

export default PromiseSignup;
