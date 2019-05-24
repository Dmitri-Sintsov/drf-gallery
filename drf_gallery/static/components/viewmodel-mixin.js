'use strict';

define(['Vue'], function (Vue) {
    return {
        methods: {
            callViewModels: function(response) {
                // todo: display alerts for HTTP status codes.
                if (typeof response.body._view !== 'undefined') {
                    var viewModels = response.body._view;
                    delete response.body._view;
                    for (var i = 0; i < viewModels.length; i++) {
                        var viewModel = viewModels[i];
                        for (var methodName in viewModel) {
                            if (viewModel.hasOwnProperty(methodName)) {
                                var viewMethod = this[methodName];
                                viewMethod.call(this, viewModel[methodName]);
                            }
                        }
                    }
                }
            },
            clearErrors: function() {
                this.$data.errors = this.getInitialFields([]);
            },
            error: function(response) {
                if (response.status === 400 && typeof this.$data.errors !== 'undefined') {
                    // Display form errors bound to view model.
                    var fieldErrors = $.extend(true, {}, this.getInitialFields([]), response.body)
                    this.$data.errors = fieldErrors;
                } else {
                    console.log(response);
                }
                this.callViewModels(response);
            },
            // view model handler
            pushRoute: function(route) {
                this.$router.push(route);
            },
            // view model handler
            setData: function(data) {
                for (var key in data) {
                    if (data.hasOwnProperty(key)) {
                        if (typeof this.$data[key] === 'undefined') {
                            Vue.set(this.$data, key, data[key]);
                        } else {
                            this.$data[key] = data[key];
                        }
                    }
                }
            },
            // view model handler
            setState: function(data) {
                for (var key in data) {
                    if (data.hasOwnProperty(key)) {
                        this.$store.commit(key, data[key]);
                    }
                }
            },
            validate: function(data) {
                console.log(JSON.stringify(data));
                return true;
            },
            submit: function(method, url, data, $event) {
                if (this.validate(data)) {
                    this.$http[method](
                        url,
                        data,
                        {headers: {'X-CSRFToken': this.$store.state.csrfToken}}
                    ).then(this.success, this.error);
                }
            },
            post: function(url, data, $event) {
                this.submit('post', url, data, $event);
            },
            success: function(response) {
                console.log(response);
                if (typeof this.$data.errors !== 'undefined') {
                    // Clear form errors, if any.
                    this.clearErrors();
                }
                this.callViewModels(response);
            },
        },
    };
});
