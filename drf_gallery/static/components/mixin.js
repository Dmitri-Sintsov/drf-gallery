define(['Vue'], function (Vue) {
    return {
        methods: {
            callViewModel: function(response) {
                // todo: display alerts for HTTP status codes.
                if (typeof response.body._view !== 'undefined') {
                    var viewModels = response.body._view;
                    delete response.body._view;
                    for (var i = 0; i < viewModels.length; i++) {
                        var viewModel = viewModels[i];
                        var viewMethod = this[viewModel.method];
                        viewMethod.call(this, viewModel, response);
                    }
                } else {
                    return false;
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
                this.callViewModel(response);
            },
            setRecursive: function(src) {
                for (key in src) {
                    if (src.hasOwnProperty(key)) {
                        if (typeof this.$data[key] === 'undefined') {
                            Vue.set(this.$data, key, src[key]);
                        } else {
                            this.$data[key] = src[key];
                        }
                    }
                }
            },
            // view model handler
            pushRoute: function(viewModel, response) {
                this.$router.push(viewModel.route);
            },
            // view model handler
            setData: function(viewModel, response) {
                this.setRecursive(viewModel.data);
            },
            // view model handler
            setState: function(viewModel, response) {
                for (key in viewModel.data) {
                    if (viewModel.data.hasOwnProperty(key)) {
                        this.$store.commit(key, viewModel.data[key]);
                    }
                }
            },
            success: function(response) {
                console.log(response);
                if (typeof this.$data.errors !== 'undefined') {
                    // Clear form errors, if any.
                    this.clearErrors();
                }
                this.callViewModel(response);
            },
        },
    };
});
