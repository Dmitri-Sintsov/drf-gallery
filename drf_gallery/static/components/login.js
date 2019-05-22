define(['text!/static/components/login.html', 'Vue', 'ViewModelMixin'], function (htmlTemplate, Vue, ViewModelMixin) {
    return Vue.component('signup', {
        template: htmlTemplate,
        store: document.getElementById('app').__vue__.$store,
        mixins: [ViewModelMixin],
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
            validate: function(form) {
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
});
