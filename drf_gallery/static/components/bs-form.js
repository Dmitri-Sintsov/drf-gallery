'use strict';

define(['text!/static/components/bs-form.html', 'Vue'], function (htmlTemplate, Vue) {
    return Vue.component('bs-form', {
        template: htmlTemplate,
        props: ['url', 'form', 'fields', 'select', 'errors'],
    });
});
