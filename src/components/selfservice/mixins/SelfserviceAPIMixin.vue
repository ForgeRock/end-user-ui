<script>
import _ from 'lodash';

/**
 * @description Mixin used for selfservice proceesses handles the general progression through the selfservice stages as well as calling the appropriate loading function
 * That is configured in each specific selfservice process controller.
 *
 * @fires GET selfservice/type (e.g. selfservice/registration) - Gets the initial requirements needed to kick off the selfservice flow.
 * @fires POST/selfservice/type?_action=submitRequirements (e.g. selfservice/registration?_action=submitRequirements) - Calls the selfservice endpoint with the current data for the stage, if the data
 * matches what is expected a new stage will be returned and loaded.
 *
 */
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
                    /*
                            If we are in progressive profiling mode we need to route back to login.
                            This can happen if a user reloads the progressive profile page while
                            in fullStack mode. We need to hit the login route again to start the
                            process over.
                        */
                    if (_.has(this.$router.currentRoute, 'params.profileProcess')) {
                        this.$router.push('/login');
                    } else {
                        /* istanbul ignore next */
                        this.displayNotification('error', error.response.data.message);
                    }
                });
        },
        advanceStage (data, noSessionFalse) {
            /* istanbul ignore next */
            let headers = this.getAnonymousHeaders();
            /* istanbul ignore next */
            if (noSessionFalse && !this.$root.applicationStore.state.authHeaders) {
                headers = {
                    'X-OpenIDM-NoSession': false,
                    'X-OpenIDM-Password': null,
                    'X-OpenIDM-Username': null
                };
            }

            /* istanbul ignore next */
            const selfServiceInstance = this.getRequestService({
                    headers: _.extend(headers, { 'X-Requested-With': 'XMLHttpRequest' })
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
