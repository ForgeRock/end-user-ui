<script>
    import _ from 'lodash';

    export default {
        name: 'Selfservice-API',
        methods: {
            loadData () {
                /* istanbul ignore next */
                const selfServiceInstance = this.getRequestService({
                    headers: this.getAnonymousHeaders()
                });
                /* istanbul ignore next */
                selfServiceInstance.get(`/selfservice/${this.apiType}`)
                    .then((selfServiceDetails) => {
                        this.setChildComponent(selfServiceDetails.data.type, selfServiceDetails.data);
                    })
                    .catch((error) => {
                        /* istanbul ignore next */
                        this.displayNotification('error', error.response.data.message);
                    });
            },
            advanceStage (data, noSession) {
                /* istanbul ignore next */
                let headers = this.getAnonymousHeaders();
                /* istanbul ignore next */
                if (noSession) {
                    headers = {
                        'X-OpenIDM-NoSession': false,
                        'X-OpenIDM-Password': null,
                        'X-OpenIDM-Username': null
                    };
                }

                /* istanbul ignore next */
                const selfServiceInstance = this.getRequestService({
                        headers: headers
                    }),
                    saveData = {
                        input: {}
                    };

                /* istanbul ignore next */
                if (this.selfServiceDetails && this.selfServiceDetails.token) {
                    saveData.token = this.selfServiceDetails.token;
                }
                /* istanbul ignore next */
                if (data.token && data.code) {
                    // We know this is from queryParams so set token with the new token value
                    saveData.token = data.token;
                }
                /* istanbul ignore next */
                saveData.input = data;
                /* istanbul ignore next */
                if (this.showSelfService) {
                    this.showSelfService = false;
                }

                /* istanbul ignore next */
                selfServiceInstance.post(`/selfservice/${this.apiType}?_action=submitRequirements`, saveData)
                    .then((selfServiceDetails) => {
                        this.setChildComponent(selfServiceDetails.data.type, selfServiceDetails.data);
                    })
                    .catch((error) => {
                        if (!_.isUndefined(this.apiErrorCallback)) {
                            this.apiErrorCallback(error);
                        }
                    });
            },
            parseQueryParams (queryParams) {
                /*
                    example =>
                    queryParams = '&token=MY_TOKEN&code=MY_CODE'
                    returns {
                        token: 'MY_TOKEN',
                        code: 'MY_CODE'
                    }
                */
                if (!queryParams.match('returnParams')) {
                    return JSON.parse(
                        `{
                            ${decodeURI('"' + queryParams.slice(1).replace(/&/g, '","').replace(/=/g, '":"')) + '"'}
                        }`
                    );
                } else {
                    return { returnParams: _.last(decodeURIComponent(queryParams).split('returnParams=')) };
                }
            }
        }
    };
</script>
