<template>
    <b-container fluid class="h-100 px-0">
        <div class="h-100 d-flex">
            <div class="m-auto fr-center-card">
                <bounce-loader :color="loadingColor"></bounce-loader>
            </div>
        </div>
    </b-container>
</template>

<script>
import _ from 'lodash';
import styles from '@/scss/main.scss';
import { BounceLoader } from 'vue-spinner/dist/vue-spinner.min.js';

/**
 * @description Return page used for oauth provider authentication. Will appropriately redirect a user to login or account claiming.
 *
 * @fires POST identityProviders?_action=handlePostAuth - Generates the token used for continuing the authentication process based off of the returned provider information
 * @fires POST authentication?_action=login - Uses data store token to establish a new user session
 */
export default {
    name: 'OAuth-Return',
    components: {
        'bounce-loader': BounceLoader
    },
    data () {
        return {
            loadingColor: styles.baseColor
        };
    },
    created () {
        let queryParams;

        /*
         * This check is for openAM fullstack only. With the return of a special URL #/handleOAuth/
         * We are given a clientToken that we can directly pass on to accountClaiming / Registration
        */
        if (this.$route.params.amData) {
            queryParams = {};

            _.each(this.$route.params.amData.replace('?', '').split('&'), (param) => {
                if (param.length > 0) {
                    let parts = param.split('=');
                    queryParams[parts[0]] = parts[1];
                }
            });

            window.history.pushState('', '', window.location.pathname);

            this.$router.push({
                name: 'AccountClaiming',
                params: {
                    clientToken: queryParams.clientToken,
                    returnParams: queryParams.returnParams
                }
            });
        } else {
            queryParams = window.location.search.replace('?', '').split('&').reduce(function (map, item) {
                let parts = item.split('='),
                    decodedValue = [decodeURIComponent(parts[1])];

                map[parts[0]] = map[parts[0]] ? map[parts[0]].concat(decodedValue) : decodedValue;
                return map;
            }, {});

            window.history.pushState('', '', window.location.pathname);

            this.$root.applicationStore.clearAuthHeadersAction();

            /* istanbul ignore next */
            const socialInstance = this.getRequestService({
                    headers: _.extend(this.getAnonymousHeaders(), {
                        'X-OpenIDM-NoSession': 'true',
                        'X-OpenIDM-DataStoreToken': localStorage.getItem('dataStoreToken')
                    })
                }),
                linkedProvider = localStorage.getItem('linkedProvider');

            /* istanbul ignore next */
            localStorage.removeItem('dataStoreToken');
            localStorage.removeItem('linkedProvider');

            /* istanbul ignore next */
            socialInstance.post('/identityProviders?_action=handlePostAuth', queryParams)
                .then((response) => {
                    let dataStoreToken = response.data.token,
                        originalToken = localStorage.getItem('accountClaimingToken');

                    localStorage.removeItem('accountClaimingToken');

                    const socialLoginInstance = this.getRequestService({
                        headers: {
                            'X-OpenIDM-NoSession': 'false',
                            'X-OpenIDM-OAuth-Login': 'true',
                            'X-OpenIDM-DataStoreToken': dataStoreToken,
                            'X-Requested-With': 'XMLHttpRequest'
                        }
                    });
                    socialLoginInstance.post('/authentication?_action=login')
                        .then((response) => {
                            /* If amDataEndpoints exist we know this if fullStack mode.
                                   We need to set the headers to be used on all this user's authenticated requests.
                                   Basically re-logging in on every request with a valid am token. We also need to
                                   grab the logoutUrl so we can use that to kill not only the idm session
                                   but also the am session. */
                            if (_.has(this.$root.applicationStore.state, 'amDataEndpoints') &&
                                this.$root.applicationStore.state.amDataEndpoints !== null
                            ) {
                                this.$root.applicationStore.setAuthHeadersAction({
                                    'X-OpenIDM-OAuth-Login': 'true',
                                    'X-OpenIDM-DataStoreToken': dataStoreToken,
                                    'X-Requested-With': 'XMLHttpRequest'
                                });

                                sessionStorage.setItem('amToken', dataStoreToken);
                                sessionStorage.setItem('resubmitDataStoreToken', 'true');
                            }

                            // Check for progressive profiling.
                            this.progressiveProfileCheck(response, () => {
                                if (linkedProvider) {
                                    this.$router.push({
                                        name: 'Profile',
                                        params: {
                                            clientToken: dataStoreToken,
                                            linkedProvider: linkedProvider
                                        }
                                    });
                                } else if (_.isNull(originalToken)) {
                                    this.$router.push('/');
                                } else {
                                    this.$router.push({
                                        name: 'AccountClaiming',
                                        params: {
                                            clientToken: dataStoreToken,
                                            originalToken: originalToken
                                        }
                                    });
                                }
                            });
                        })
                        .catch(() => {
                            this.$router.push({
                                name: 'AccountClaiming',
                                params: {
                                    clientToken: dataStoreToken,
                                    originalToken: originalToken
                                }
                            });
                        });
                })
                .catch((error) => {
                    this.$router.push('/login');
                    this.displayNotification('error', error.response.data.message);
                });
        }
    }
};
</script>
