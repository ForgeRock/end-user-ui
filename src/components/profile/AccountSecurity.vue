<template>
    <fr-list-group :title="$t('pages.profile.accountSecurity.title')" :subtitle="$t('pages.profile.accountSecurity.subtitle')">

        <fr-edit-password @updateProfile="sendUpdateProfile"></fr-edit-password>
        <fr-edit-kba v-if="isOnKBA" :kbaData="kbaData" @updateProfile="sendUpdateProfile"></fr-edit-kba>

    </fr-list-group>
</template>

<script>
    import EditKBA from '@/components/profile/EditKBA';
    import EditPassword from '@/components/profile/EditPassword';
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
        methods: {
            sendUpdateProfile (payload, config) {
                this.$emit('updateProfile', payload, config);
            }
        },
        mounted () {
            /* istanbul ignore next */
            let selfServiceInstance = this.getRequestService({
                headers: this.getAnonymousHeaders()
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
