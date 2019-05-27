'use strict';

requirejs.config({
    paths: {
        'jquery': '/static/admin/js/vendor/jquery/jquery.min',
        'text': '/static/js/require/text.min',
        'Vue': '/static/js/vue/vue',
        'Vuex': '/static/js/vue/vuex',
        'VueRouter': '/static/js/vue/vue-router',
        'VueResource': '/static/js/vue/vue-resource',
        'ViewModelMixin': '/static/components/viewmodel-mixin',
    },
});

require(
    ['jquery', 'Vue', 'Vuex', 'VueRouter', 'VueResource', 'ViewModelMixin'],
    function ($, Vue, Vuex, VueRouter, VueResource, ViewModelMixin) {

        var DELIMITER_PATCH = { replace: function() { return '^(?!.).' } };
        Vue.mixin({
            delimiters: [DELIMITER_PATCH, DELIMITER_PATCH]
        });
        Vue.use(Vuex);
        Vue.use(VueRouter);
        Vue.use(VueResource);

        function loadComponent(name) {
            return function (resolve) {
                var result = require([name], resolve);
                return result;
            };
        };
        var store = new Vuex.Store({
            state: function () {
                var vueStoreJson = document.getElementById('vue_store_json');
                return vueStoreJson ? JSON.parse(vueStoreJson.textContent) : {};
            },
            mutations: {
                user: function(state, user) {
                    Vue.set(state, 'user', user);
                },
                csrfToken: function(state, csrfToken) {
                    Vue.set(state, 'csrfToken', csrfToken);
                },
            },
        });

        var Home = {
            template: '#home_template'
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
            router,
            store,
            mixins: [ViewModelMixin],
            methods: {
                logout: function() {
                    this.$http.post(
                        '/users/logout/',
                        {},
                        {headers: {'X-CSRFToken': store.state.csrfToken}}
                    ).then(this.success, this.error);
                },
            },
        }).$mount('#app');
    }
);
