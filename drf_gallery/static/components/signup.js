'use strict';

define(['text!/static/components/signup.html', 'Vue', 'ViewModelMixin'], function (htmlTemplate, Vue, ViewModelMixin) {
    return Vue.component('signup', {
        template: htmlTemplate,
        store: document.getElementById('app').__vue__.$store,
        mixins: [ViewModelMixin],
        data: function() {
            return {
                // select options
                select: {
                    eye_color: [],
                    birth_country: [],
                },
                // Form fields (meta)
                fields: {
                    'first_name': {
                        type: 'text',
                        label: 'Имя',
                    },
                    'last_name': {
                        type: 'text',
                        label: 'Фамилия',
                    },
                    'profile.patronymic': {
                        type: 'text',
                        label: 'Отчество',
                    }
                },
                // Form data
                form: this.$deepModel(this.getInitialFields()),
                // Form errors
                errors: this.$deepModel(this.getInitialFields([])),
            };
        },
        created: function() {
            this.get('/eye-colors/select_list/').then(function() {
                this.get('/birth-countries/select_list/');
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
                    profile: {
                        patronymic: v,
                        birth_date: v,
                        eye_color: {
                            title: v,
                        },
                        birth_country: {
                            title: v,
                        },
                    },
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
});
