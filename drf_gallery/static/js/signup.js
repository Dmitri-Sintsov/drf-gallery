var Signup = Vue.component('signup', {
    template: '#signup_template',
    data: function() {
        var fields = {
            first_name: '',
            last_name: '',
            email: '',
            password: '',
            password2: '',
            profile: {
                eye_color: {
                    title: '',
                },
                birth_country: {
                    title: '',
                },
            },
        };
        return {
            // Form fields
            form: fields,
            // Form errors
            errors: _.cloneDeep(fields),
        };
    },
    methods: {
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
                        this.$data.errors = Object.assign({}, this.$data.errors, response.body);
                        // this.$data.errors = response.body;
                    }
                };
                this.$http.post('/users/', this.$data.form).then(success, error);
            }
        },
    },
});
