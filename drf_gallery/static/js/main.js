requirejs.config({
    paths: {
        'jquery': '/static/admin/js/vendor/jquery/jquery.min',
        'text': '/static/js/require/text.min',
        'Vue': '/static/js/vue/vue',
        'VueRouter': '/static/js/vue/vue-router',
        'VueResource': '/static/js/vue/vue-resource',
    },
});

function loadComponent(name) {
    return function (resolve) {
        var result = require([name], resolve);
        return result;
    };
}

require(['jquery', 'Vue', 'VueRouter', 'VueResource'], function ($, Vue, VueRouter, VueResource) {

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
        {path: '/signup', component: loadComponent('/static/components/signup.js')},
        {path: '/login', component: Login},
    ];
    var router = new VueRouter({
        routes // short for `routes: routes`
    });
    var app = new Vue({
        'router': router,
        data: function() {
            var user = false;
            var userJson = document.getElementById('user_json');
            if (userJson) {
                user = JSON.parse(userJson.textContent);
            }
            return {
                'user': user,
            };
        },
    }).$mount('#app');
});
