var Signup = Vue.component('signup', {
    template: '#signup_template',
    data: function() {
        return {
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
                var success = function(response) {
                    console.log(response);
                };
                var error = function(response) {
                    console.log(response);
                    if (response.status === 400) {
                        var fieldErrors = $.extend(true, {}, this.getInitialFields([]), response.body)
                        this.$data.errors = fieldErrors;
                    }
                };
                this.$http.post('/users/', this.$data.form).then(success, error);
            }
        },
    },
});
