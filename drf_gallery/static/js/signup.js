var Signup = Vue.component('signup', {
    template: '#signup_template',
    data: function() {
        return {
            // Form fields
            form: {
                first_name: '',
                last_name: '',
                email: '',
                password: '',
                password2: '',
                profile: {
                    eye_color: '',
                    birth_country: '',
                },
            },
            // Form errors
            errors: {},
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
                var success = function(data) {
                    console.log(data);
                };
                var error = function(data) {
                    console.log(data);
                };
                var form = JSON.parse(JSON.stringify(this.$data.form));
                this.$http.post('/users/', form).then(success, error);
            }
        },
    },
});
