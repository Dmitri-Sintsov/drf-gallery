'use rollup'

import Vue from '../js/vue/vue.esm.browser.js';
import Vuex from '../js/vue/vuex.esm.browser.js';
import VueRouter from '../js/vue/vue-router.esm.browser.js';
import ViewModelMixin from './viewmodel-mixin.js';
import PromiseSignup from './signup.js';
import PromiseLogin from './login.js';
import PromiseAlbums from './albums.js';


var DELIMITER_PATCH = { replace: function() { return '^(?!.).' } };
Vue.mixin({
    delimiters: [DELIMITER_PATCH, DELIMITER_PATCH]
});
Vue.use(Vuex);
Vue.use(VueRouter);

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

function getRoutes() {
    return [
        {
            path: '/', name: 'home', component: Home,
            meta: {text: 'В начало',  isAnon: null},
        },
        {
            path: '/signup', name: 'signup', component: async function() {
                return await PromiseSignup();
            },
            meta: {text: 'Зарегистрироваться', isAnon: true},
        },
        {
            path: '/login', name: 'login', component: async function() {
                return await PromiseLogin();
            },
            meta: {text: 'Войти', isAnon: true},
        },
        {
            path: '/albums/:owner_id', name: 'albums', component: async function() {
                return await PromiseAlbums();
            },
            meta: {text: 'Альбомы', isAnon: false},
        },
        {
            path: '/logout', name: 'logout',
            meta: {text: 'Выйти', isAnon: false},
        },
    ];
};

var router = new VueRouter({
    routes: getRoutes(), // short for `routes: routes`
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
