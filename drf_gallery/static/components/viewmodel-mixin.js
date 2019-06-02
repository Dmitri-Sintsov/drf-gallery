'use strict';

define(['Vue', 'dot'], function (Vue, dot) {
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
            updateData: function(data, $data) {
                if ($data === undefined) {
                    $data = this.$data;
                }
                for (var key in data) {
                    if (data.hasOwnProperty(key)) {
                        if (typeof $data[key] === 'undefined') {
                            Vue.set($data, key, data[key]);
                        } else {
                            if (typeof $data[key] === 'object' && $data[key] !== null) {
                                this.updateData(data[key], $data[key]);
                            } else {
                                this.$data[key] = data[key];
                            }
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
            setArrayObjectKey: function($data, dataFilter, val) {
                for (var i = 0; i < $data.length; i++) {
                    var matchesData = true;
                    for (var dataKey in dataFilter) {
                        if (dataFilter.hasOwnProperty(dataKey)) {
                            if (typeof $data[i][dataKey] === 'undefined' || $data[i][dataKey] !== dataFilter[dataKey]) {
                                matchesData = false;
                                break;
                            }
                        }
                    }
                    if (matchesData) {
                        if (typeof val === 'object' && val !== null && !(val instanceof Array)) {
                            for (var objKey in val) {
                                if (val.hasOwnProperty(objKey)) {
                                    $data[i][objKey] = val[objKey];
                                }
                            }
                        } else {
                            $data[i] = val;
                        }
                    }
                }
            },
            clearErrors: function() {
                this.$data.errors = this.getInitialFields([]);
            },
            error: function(response, data) {
                if (data !== undefined && response.status === 400 && typeof this.$data.errors !== 'undefined') {
                    // Display form errors bound to view model.
                    var dotErrors = dot.dot(response.body);
                    var fieldErrors = $.extend(true, {}, this.getInitialFields([]), dotErrors)
                    this.$data.errors = fieldErrors;
                } else {
                    console.log(response);
                }
                this.callViewModels(response);
            },
            validate: function(data) {
                console.log(JSON.stringify(data));
                return true;
            },
            /**
             * Set data = undefined in case the request is not the form submission
             * thus form validation should be skipped.
             */
            submit: function(method, url, data, $event) {
                if (data === undefined || this.validate(data)) {
                    var nestedData = (data === undefined) ? data : dot.object(data);
                    // return chained Promise.
                    return this.$http[method](
                        url,
                        nestedData,
                        {headers: {'X-CSRFToken': this.$store.state.csrfToken}}
                    ).then(
                        function(response) {
                            this.success(response, data);
                            // return chained Promise result.
                            return response;
                        },
                        function(response) {
                            this.error(response, data);
                            // return chained Promise result.
                            return response;
                        }
                    );
                }
            },
            get: function(url, data, $event) {
                return this.submit('get', url, data, $event);
            },
            post: function(url, data, $event) {
                return this.submit('post', url, data, $event);
            },
            put: function(url, data, $event) {
                return this.submit('put', url, data, $event);
            },
            patch: function(url, data, $event) {
                return this.submit('patch', url, data, $event);
            },
            delete: function(url, data, $event) {
                return this.submit('delete', url, data, $event);
            },
            success: function(response, data) {
                console.log(response);
                if (data !== undefined && typeof this.$data.errors !== 'undefined') {
                    // Clear form errors, if any.
                    this.clearErrors();
                }
                this.callViewModels(response);
            },
        },
    };
});
