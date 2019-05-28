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
            this.get('/albums/', {owner_id: this.$route.params.owner_id}).then(function(response) {
                this.albums = response.body;
            });
        },
        methods: {
        },
    });
});
