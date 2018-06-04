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
    import { BounceLoader } from 'vue-spinner/dist/vue-spinner.min.js';
    import CenterCard from '@/components/utils/CenterCard';
    import styles from '../../scss/main.scss';
    import _ from 'lodash';

    export default {
        name: 'OAuth-Return',
        components: {
            'fr-center-card': CenterCard,
            'bounce-loader': BounceLoader
        },
        data () {
            return {
                loadingColor: styles.baseColor
            };
        },
        created () {
            /* istanbul ignore next */
            let queryParams = window.location.search.replace('?', '').split('&').reduce(function (map, item) {
                let parts = item.split('='),
                    decodedValue = [decodeURIComponent(parts[1])];

                map[parts[0]] = map[parts[0]] ? map[parts[0]].concat(decodedValue) : decodedValue;
                return map;
            }, {});

            /* istanbul ignore next */
            const socialInstance = this.getRequestService({
                headers: _.extend(this.getAnonymousHeaders(), {
                    'X-OpenIDM-NoSession': 'true',
                    'X-OpenIDM-DataStoreToken': localStorage.getItem('dataStoreToken')
                })
            });

            /* istanbul ignore next */
            localStorage.removeItem('dataStoreToken');
            /* istanbul ignore next */
            socialInstance.post('/identityProviders?_action=handlePostAuth', queryParams)
                .then((response) => {
                    let dataStoreToken = response.data.token;
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
                            /* If setAuthHeaders is true we know this if fullStack mode.
                               We need to set the headers to be used on all this user's authenticated requests.
                               Basically re-logging in on every request with a valid am token. We also need to
                               grab the logoutUrl so we can use that to kill not only the idm session
                               but also the am session. */
                            if (sessionStorage.getItem('setAuthHeaders')) {
                                this.$root.applicationStore.setAuthHeadersAction({
                                    'X-OpenIDM-OAuth-Login': 'true',
                                    'X-OpenIDM-DataStoreToken': dataStoreToken,
                                    'X-Requested-With': 'XMLHttpRequest'
                                });
                                this.$root.applicationStore.setAuthLogoutUrlAction(response.data.authorization.logoutUrl || null);
                                sessionStorage.removeItem('setAuthHeaders');
                            }

                            // Check for progressive profiling.
                            if (
                                _.has(response, 'data.authorization.requiredProfileProcesses') &&
                                response.data.authorization.requiredProfileProcesses.length > 0
                            ) {
                                let profileProcess = response.data.authorization.requiredProfileProcesses[0].split('/')[1];
                                this.$router.push(`/profileCompletion/${profileProcess}`);
                            } else {
                                window.history.pushState('', '', window.location.pathname);
                                this.$router.push('/profile');
                            }
                        })
                        .catch(() => {
                            // TODO: ATTEMPT SOCIAL ACCOUNT LINKING OPENIDM-10441

                            // ELSE JUST DO REGISTRATION:
                            this.$router.push({name: 'Registration', params: {clientToken: response.data.token}});
                        });
                })
                .catch((error) => {
                    window.history.pushState('', '', window.location.pathname);
                    this.$router.push('/login');
                    this.displayNotification('error', error.response.data.message);
                });
        }
    };
</script>
