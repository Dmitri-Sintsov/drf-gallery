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
            setRecursive: function(src, dst) {
                for (key in src) {
                    if (src.hasOwnProperty(key)) {
                        if (typeof src[key] === 'object' && src[key] !== null) {
                            $.extend(true, dst[key], src[key]);
                        } else {
                            dst[key] = src[key];
                        }
                    }
                }
            },
            // view model handler
            setData: function(viewModel, response) {
                this.setRecursive(viewModel.data, this.$data);
            },
            // view model handler
            setState: function(viewModel, response) {
                this.$store.commit('user', viewModel.data.user);
                this.$store.commit('csrfToken', viewModel.data.csrfToken);
                // this.setRecursive(viewModel.data, this.$store.state);
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
