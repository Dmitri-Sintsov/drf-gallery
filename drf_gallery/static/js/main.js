requirejs.config({
    paths: {
        'jquery': '/static/admin/js/vendor/jquery/jquery.min',
        'text': '/static/js/require/text.min',
        'Vue': '/static/js/vue/vue',
        'VueRouter': '/static/js/vue/vue-router',
        'VueResource': '/static/js/vue/vue-resource',
        'ViewModelMixin': '/static/components/mixin',
    },
});

function loadComponent(name) {
    return function (resolve) {
        var result = require([name], resolve);
        return result;
    };
}

require(
    ['jquery', 'Vue', 'VueRouter', 'VueResource', 'ViewModelMixin'],
    function ($, Vue, VueRouter, VueResource, ViewModelMixin) {

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
            {path: '/login', component: loadComponent('/static/components/login.js')},
        ];
        var router = new VueRouter({
            routes // short for `routes: routes`
        });
        var app = new Vue({
            'router': router,
            mixins: [ViewModelMixin],
            methods: {
                getGlobals: function() {
                    var globalsJson = document.getElementById('globals_json');
                    return globalsJson ? JSON.parse(globalsJson.textContent) : {};
                },
                logout: function() {
                    this.$http.post(
                        '/users/logout/',
                        {},
                        {headers: {'X-CSRFToken': csrfToken}}
                    ).then(this.success, this.error);
                },
            },
            data: function() {
                return {
                    globals: this.getGlobals(),
                };
            },
        }).$mount('#app');
    }
);
