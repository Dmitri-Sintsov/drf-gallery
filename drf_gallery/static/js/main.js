document.addEventListener('DOMContentLoaded', function() {
    var DELIMITER_PATCH = { replace: function() { return '^(?!.).' } };
    Vue.mixin({
        delimiters: [DELIMITER_PATCH, DELIMITER_PATCH]
    });
    Vue.use(VueRouter);

    var Home = {
        template: '#home_template'
    };
    var Signup = Vue.component('signup', {
        template: '#signup_template',
        data: function() {
            return {
                // Form fields
                first_name: '',
                second_name: '',
                email: '',
                password: '',
                password2: '',
                profile: {
                    eye_color: '',
                    birth_country: '',
                },
                // Form errors
                errors: {
                    password: [],
                    password2: [],
                },
            };
        },
        methods: {
            validate: function() {
                var errors = [];
                if (this.$data.password !== this.$data.password2) {
                    errors.push('Пароли должны совпадать');
                } else if (this.$data.password == '') {
                    errors.push('Пароль не должен быть пустым');
                }
                this.$data.errors.password = errors;
                this.$data.errors.password2 = errors;
            },
            submit: function(event) {
                this.validate();
                console.log(JSON.stringify(this.$data));
            },
        },
    });
    var Login = {
        template: '#login_template'
    };
    var routes = [
        {path: '/', component: Home},
        {path: '/signup', component: Signup},
        {path: '/login', component: Login}
    ];
    var router = new VueRouter({
        routes // short for `routes: routes`
    });
    var app = new Vue({
        'router': router,
    }).$mount('#app');
});
