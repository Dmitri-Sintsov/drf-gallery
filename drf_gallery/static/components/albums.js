'use strict';

define(['text!/static/components/albums.html', 'Vue', 'ViewModelMixin'], function (htmlTemplate, Vue, ViewModelMixin) {
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
});
