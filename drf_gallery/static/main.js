var DELIMITER_PATCH = { replace: function() { return '^(?!.).' } };
Vue.mixin({
    delimiters: [DELIMITER_PATCH, DELIMITER_PATCH]
});
