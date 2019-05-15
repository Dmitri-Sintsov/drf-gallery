document.addEventListener('DOMContentLoaded', function() {
    var DELIMITER_PATCH = { replace: function() { return '^(?!.).' } };
    Vue.mixin({
        delimiters: [DELIMITER_PATCH, DELIMITER_PATCH]
    });
    Vue.use(VueRouter);
    Vue.use(VueResource);

    var Home = {
        template: '#home_template'
    };
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
