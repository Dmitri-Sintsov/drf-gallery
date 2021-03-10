'use strict';

import Vue from '../js/vue/vue.esm.browser.js';
import axios from '../js/vue/axios-esm.js';

var ViewModelMixin = {
    methods: {
        callViewModels: function(response) {
            // todo: display alerts for HTTP status codes.
            if (typeof response.data._view !== 'undefined') {
                var viewModels = response.data._view;
                delete response.data._view;
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
        error: function(response, data) {
            console.log(response);
            if (response.status === 400) {
                this.callViewModels(response);
            }
        },
        success: function(response, data) {
            console.log(response);
            this.callViewModels(response);
        },
        /**
         * Set data = undefined in case the request is not the form submission.
         */
        submit: function(method, url, data, $event) {
            var self = this;
            // return chained Promise.
            return axios[method](
                url,
                data,
                {headers: {'X-CSRFToken': this.$store.state.csrfToken}}
            ).then(
                function(response) {
                    self.success(response, data);
                    // return chained Promise result.
                    return response;
                }
            ).catch(
                function(error) {
                    if (typeof error.response !== 'undefined') {
                        self.error(error.response, data);
                        // return chained Promise result.
                        return error.response;
                    } else {
                        console.log(error);
                    }
                }
            );
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
        del: function(url, data, $event) {
            return this.submit('delete', url, data, $event);
        },
        // bs-form component support.
        formFieldChange: function(inputName, inputValue) {
            this.form[inputName] = inputValue;
        },
        // bs-form component support.
        setFormErrors: function(formErrors) {
            this.errors = formErrors;
        },
    },
};

export default ViewModelMixin;
