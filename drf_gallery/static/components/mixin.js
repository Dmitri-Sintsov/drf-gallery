define(['Vue'], function (Vue) {
    return {
        methods: {
            callViewModel: function(response) {
                // todo: display alerts for HTTP status codes.
                if (typeof response.body._view !== 'undefined') {
                    var viewModel = response.body._view;
                    delete response.body._view;
                    var viewMethod = this[viewModel.method];
                    var result = viewMethod.call(this, viewModel, response.body);
                    return (result === undefined) ? true : result;
                } else {
                    return false;
                }
            },
            getRouter: function() {
                return document.getElementById('app').__vue__;
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
            // view model
            setUserInfo: function(viewModel, user) {
                var router = this.getRouter();
                if (Object.keys(user).length === 0) {
                    // Logout was performed.
                    user = false;
                }
                router.$data.globals.user = user;
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
