<template>
    <fr-list-group :title="$t('pages.profile.accountSecurity.title')" :subtitle="$t('pages.profile.accountSecurity.subtitle')">
        
        <fr-edit-password></fr-edit-password>
        <fr-edit-kba v-if="isOnKBA" :kbaData="kbaData"></fr-edit-kba>
        
    </fr-list-group>
</template>

<script>
    import EditKBA from '@/components/selfservice/profile/EditKBA';
    import EditPassword from '@/components/selfservice/profile/EditPassword';
    import ListGroup from '@/components/utils/ListGroup';

    export default {
        name: 'Account-Security',
        data () {
            return {
                isOnKBA: false,
                kbaData: {}
            };
        },
        components: {
            'fr-list-group': ListGroup,
            'fr-edit-kba': EditKBA,
            'fr-edit-password': EditPassword
        },
        mounted () {
            /* istanbul ignore next */
            let selfServiceInstance = this.getRequestService({
                headers: {
                    'X-OpenIDM-NoSession': true,
                    'X-OpenIDM-Password': 'anonymous',
                    'X-OpenIDM-Username': 'anonymous'
                }
            });

            // TODO - replace this with call to 'Liveness Service'
            /* istanbul ignore next */
            selfServiceInstance.get('selfservice/kba').then((response) => {
                this.isOnKBA = true;
                this.kbaData = response.data;
            })
            /* istanbul ignore next */
            .catch(() => {
                this.isOnKBA = false;
            });
        }
    };
</script>
