'use strict';

define(['text!/static/components/signup.html', 'Vue', 'ViewModelMixin'], function (htmlTemplate, Vue, ViewModelMixin) {
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
                self.$data.fields = response.data;
                self.get('/eye-colors/').then(function(response) {
                    response.data.unshift({
                        title: '', description: '',
                    });
                    self.setArrayObjectKey(
                        self.$data.fields,
                        {'name': 'profile.eye_color.title'},
                        {'options': response.data}
                    );
                });
                self.get('/birth-countries/').then(function(response) {
                    response.data.unshift({
                        title: '', description: '',
                    });
                    self.setArrayObjectKey(
                        self.$data.fields,
                        {'name': 'profile.birth_country.title'},
                        {'options': response.data}
                    );
                });
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
});
