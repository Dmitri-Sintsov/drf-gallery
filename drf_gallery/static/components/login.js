define(['text!/static/components/login.html', 'Vue'], function (htmlTemplate, Vue) {
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
                var errors = [];
                var form = this.$data.form;
                if (form.email === '') {
                    errors.email = ['email не должен быть пустым']
                }
                if (form.password === '') {
                    errors.password = ['Пароль не должен быть пустым'];
                }
                Vue.set(this.$data, 'errors', errors);
                return errors.length === 0;
            },
            submit: function(event) {
                console.log(JSON.stringify(this.$data));
                if (this.validate()) {
                    this.$http.get(
                        '/users/',
                        this.$data.form,
                        {headers: {'X-CSRFToken': csrfToken}}
                    ).then(this.success, this.error);
                }
            },
            success: function(response) {
                console.log(response);
                var router = document.getElementById('app').__vue__;
                router.$data.user = response.body;
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
