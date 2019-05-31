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
        'BsForm': '/static/components/bs-form',
    },
});

require(
    ['jquery', 'Vue', 'Vuex', 'VueRouter', 'VueResource', 'ViewModelMixin', 'BsForm'],
    function ($, Vue, Vuex, VueRouter, VueResource, ViewModelMixin, BsForm) {

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
            {
                path: '/', name: 'home', component: Home,
                meta: {text: 'В начало',  isAnon: null},
            },
            {
                path: '/signup', name: 'signup', component: loadComponent('/static/components/signup.js'),
                meta: {text: 'Зарегистрироваться', isAnon: true},
            },
            {
                path: '/login', name: 'login', component: loadComponent('/static/components/login.js'),
                meta: {text: 'Войти', isAnon: true},
            },
            {
                path: '/albums/:owner_id', name: 'albums', component: loadComponent('/static/components/albums.js'),
                meta: {text: 'Альбомы', isAnon: false},
            },
            {
                path: '/logout', name: 'logout',
                meta: {text: 'Выйти', isAnon: false},
            },
        ];
        var router = new VueRouter({
            'routes': routes, // short for `routes: routes`
            linkActiveClass: "active",
            linkExactActiveClass: "active",
        });
        var app = new Vue({
            router,
            store,
            mixins: [ViewModelMixin],
            watch: {
                '$route': function(to, from) {
                    if (to.name === 'logout') {
                        this.post('/users/logout/');
                    }
                },
            }
        }).$mount('#app');
    }
);
