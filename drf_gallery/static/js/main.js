'use strict';

import Vue from '/static/js/vue/vue.esm.browser.js';
import Vuex from '/static/js/vue/vuex.esm.browser.js';
import VueRouter from '/static/js/vue/vue-router.esm.browser.js';
import ViewModelMixin from '/static/components/viewmodel-mixin.js';
import PromiseSignup from '/static/components/signup.js';
import PromiseBsForm from '/static/components/bs-form.js';
import PromiseLogin from '/static/components/login.js';
import PromiseAlbums from '/static/components/albums.js';


var DELIMITER_PATCH = { replace: function() { return '^(?!.).' } };
Vue.mixin({
    delimiters: [DELIMITER_PATCH, DELIMITER_PATCH]
});
Vue.use(Vuex);
Vue.use(VueRouter);

(async function() {
    return await PromiseBsForm();
})();

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
