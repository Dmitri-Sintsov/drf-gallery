define(['text!/static/components/signup.html', 'Vue'], function (htmlTemplate, Vue) {
    return Vue.component('signup', {
        template: htmlTemplate,
        data: function() {
            return {
                // Form fields
                form: this.getInitialFields(),
                // Form errors
                errors: this.getInitialFields([]),
            };
        },
        methods: {
            getRouter: function() {
                return document.getElementById('app').__vue__;
            },
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
            submit: function(event) {
                console.log(JSON.stringify(this.$data));
                if (this.validate()) {
                    this.$http.post(
                        '/users/',
                        this.$data.form,
                        {headers: {'X-CSRFToken': csrfToken}}
                    ).then(this.success, this.error);
                }
            },
            success: function(response) {
                console.log(response);
                var router = this.getRouter();
                router.$data.globals.user = response.body;
            },
            error: function(response) {
                console.log(response);
                if (response.status === 400) {
                    var fieldErrors = $.extend(true, {}, this.getInitialFields([]), response.body)
                    this.$data.errors = fieldErrors;
                }
            },
        },
    });
});
