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
                    const socialLoginInstance = this.getRequestService({
                        headers: {
                            'X-OpenIDM-NoSession': 'false',
                            'X-OpenIDM-OAuth-Login': 'true',
                            'X-OpenIDM-DataStoreToken': response.data.token,
                            'X-Requested-With': 'XMLHttpRequest'
                        }
                    });

                    socialLoginInstance.post('/authentication?_action=login')
                        .then((response) => {
                            window.history.pushState('', '', window.location.pathname);
                            this.$router.push('/profile');
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
