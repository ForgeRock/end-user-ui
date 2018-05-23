<template>
    <fr-center-card :showLogo="true">
        <div slot="center-card-header">
            <h2 class="h2">{{$t('pages.login.signIn')}}</h2>
        </div>

        <b-card-body slot="center-card-body">
            <transition name="slide-fade">
                <div v-if="wrongPasswordSubmitted" class="alert alert-danger mb-4 text-left" role="alert">
                    {{$t('pages.login.badPassword')}}
                    <router-link to="PasswordReset">{{$t('pages.login.recoverPassword')}}</router-link>
                </div>
            </transition>

            <fr-social-buttons signin></fr-social-buttons>

            <b-form class="form-signin mb-3" @submit.prevent="submit">

                <fr-floating-label-input v-model="username" fieldName="username" :label="$t('pages.login.username')" type="text" autofocus="true"></fr-floating-label-input>
                <fr-floating-label-input v-model="password" fieldName="password" :label="$t('pages.login.password')" :reveal="true" type="password"></fr-floating-label-input>

                <b-button type="submit" variant="primary" class="btn btn-block btn-lg">
                    {{$t('pages.login.signIn')}}
                </b-button>
            </b-form>
            <p class="text-center"><router-link action="" to="ForgotUsername">{{$t('pages.login.forgotUsername')}}</router-link> · <router-link to="PasswordReset">{{$t('pages.login.forgotPassword')}}</router-link></p>
        </b-card-body>

        <b-card-footer slot="center-card-footer">
            {{$t('pages.login.newHere')}}
            <router-link action="" to="Registration">{{$t('pages.login.createAccount')}}</router-link>
        </b-card-footer>
    </fr-center-card>
</template>

<script>
    import _ from 'lodash';
    import FloatingLabelInput from '@/components/utils/FloatingLabelInput';
    import CenterCard from '@/components/utils/CenterCard';
    import axios from 'axios';
    import SocialButtons from '@/components/mains/SocialButtons';

    export default {
        name: 'Login',
        components: {
            'fr-floating-label-input': FloatingLabelInput,
            'fr-center-card': CenterCard,
            'fr-social-buttons': SocialButtons
        },
        data () {
            return {
                username: '',
                password: '',
                wrongPasswordSubmitted: false
            };
        },
        mounted () {
            if (window.location.search && window.location.search.includes('state')) {
                this.$router.push('/oauthReturn');
            }
        },
        methods: {
            submit () {
                /* istanbul ignore next */
                var loginServiceInstance = this.getRequestService({
                        headers: {
                            'X-OpenIDM-NoSession': false,
                            'X-OpenIDM-Password': this.password,
                            'X-OpenIDM-Username': this.username
                        },
                        timeout: 5000
                    }),
                    idmInstance = this.getRequestService({
                        headers: this.getAnonymousHeaders()
                    });

                /* istanbul ignore next */
                idmInstance.post('/authentication?_action=logout').then(() => {
                    loginServiceInstance.post('/authentication?_action=login').then((userDetails) => {
                        this.$root.userStore.setUserIdAction(userDetails.data.authorization.id);
                        this.$root.userStore.setManagedResourceAction(userDetails.data.authorization.component);
                        this.$root.userStore.setRolesAction(userDetails.data.authorization.roles);
                        // Check for progressive profiling.
                        if (
                            _.has(userDetails, 'data.authorization.requiredProfileProcesses') &&
                            userDetails.data.authorization.requiredProfileProcesses.length > 0
                        ) {
                            let profileProcess = userDetails.data.authorization.requiredProfileProcesses[0].split('/')[1];
                            this.$router.push(`/profileCompletion/${profileProcess}`);
                        } else {
                            axios.all([
                                loginServiceInstance.get(`${userDetails.data.authorization.component}/${userDetails.data.authorization.id}`),
                                loginServiceInstance.get(`schema/${userDetails.data.authorization.component}`)]).then(axios.spread((profile, schema) => {
                                    this.$root.userStore.setProfileAction(profile.data);
                                    this.$root.userStore.setSchemaAction(schema.data);

                                    this.$router.push('/profile');
                                }))
                                .catch((error) => {
                                    /* istanbul ignore next */
                                    this.displayNotification('error', error.response.data.message);
                                });
                        }
                    })
                    .catch(() => {
                        this.wrongPasswordSubmitted = true;
                    });
                });

                return false;
            }
        }
    };
</script>
