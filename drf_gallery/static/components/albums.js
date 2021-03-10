'use strict';

import axios from '/static/js/vue/axios-esm.js';
import Vue from '/static/js/vue/vue.esm.browser.js';
import ViewModelMixin from '/static/components/viewmodel-mixin.js';


async function PromiseAlbums() {
    var response = await axios.get('/static/components/albums.html');
    var htmlTemplate = response.data;
    return Vue.component('albums', {
        template: htmlTemplate,
        store: document.getElementById('app').__vue__.$store,
        mixins: [ViewModelMixin],
        data: function() {
            return {
                albums: [],
            };
        },
        created: function() {
            var self = this;
            this.get('/albums/', {params: {owner_id: this.$route.params.owner_id}}).then(function(response) {
                self.albums = response.data;
            });
        },
        methods: {
        },
    });
};

export default PromiseAlbums;
