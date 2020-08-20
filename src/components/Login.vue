<template>
    <fr-center-card :showLogo="true">
        <div slot="center-card-header">
            <h2 class="h2">{{$t('pages.login.signIn')}}</h2>
        </div>

        <b-card-body slot="center-card-body">
            <transition name="slide-fade">
                <div v-if="wrongPasswordSubmitted" class="alert alert-danger mb-4 text-left" role="alert">
                    {{$t('pages.login.badPassword')}}
                    <span v-if="this.$root.applicationStore.state.passwordReset"><br/>{{$t('pages.login.weCanHelp')}} <router-link v-if="this.$root.applicationStore.state.passwordReset" action="" :to="{name: 'PasswordReset'}">{{$t('pages.login.recoverPassword')}}</router-link></span>
                    <span v-if="this.$root.applicationStore.state.usernameRecovery"><br/>{{$t('pages.login.weCanHelp')}} <router-link action="" :to="{name: 'ForgotUsername'}">{{$t('pages.login.recoverUsername')}}</router-link></span>
                </div>
            </transition>

            <fr-social-buttons :signin="true"></fr-social-buttons>

            <b-form class="form-signin mb-3" @submit.prevent="submit">

                <fr-floating-label-input v-model="username" fieldName="username" :label="$t('pages.login.username')" type="text" autofocus="true"></fr-floating-label-input>
                <fr-floating-label-input v-model="password" fieldName="password" :label="$t('pages.login.password')" :reveal="true" type="password"></fr-floating-label-input>

                <b-button type="submit" variant="primary" class="btn btn-block btn-lg">
                    {{$t('pages.login.signIn')}}
                </b-button>
            </b-form>
            <p class="text-center"><router-link v-if="this.$root.applicationStore.state.usernameRecovery" action="" :to="{name: 'ForgotUsername'}">{{$t('pages.login.forgotUsername')}}</router-link>
                <span class="mx-1" v-if="this.$root.applicationStore.state.usernameRecovery && this.$root.applicationStore.state.passwordReset">·</span>
                <router-link v-if="this.$root.applicationStore.state.passwordReset" action="" :to="{name: 'PasswordReset'}">{{$t('pages.login.forgotPassword')}}</router-link>
            </p>
        </b-card-body>
        <template v-if="this.$root.applicationStore.state.registration">
            <b-card-footer slot="center-card-footer" class="fr-footer-bottom">
                {{$t('pages.login.newHere')}}
                <router-link action="" :to="{name: 'Registration'}">{{$t('pages.login.createAccount')}}</router-link>
            </b-card-footer>
        </template>
    </fr-center-card>
</template>

<script>
import _ from 'lodash';
import axios from 'axios';
import CenterCard from '@/components/utils/CenterCard';
import FloatingLabelInput from '@/components/utils/FloatingLabelInput';
import SocialButtons from '@/components/utils/SocialButtons';

/**
 * @description Controlling component to allow users to manually login, socially login or start of a selfservice process (username, password or registration) if configured.
 *
 * @fires POST authentication?_action=logout - Ends current user session
 * @fires POST authentication?_action=login - Uses username and password to establish a new user session
 * @fires GET type/name/id (e.g. managed/user/_id) - Resource details, in this context it is for the successfully logged in user
 * @fires POST privilege?_action=listPrivileges - Check to see if a user has any privilege based access
 * @fires GET schema/type/name/ (e.g. schema/managed/user) - Schema for a resource
 *
 */
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
        // In case account claiming is cancelled midway through this will clear the storage token
        localStorage.removeItem('accountClaimingToken');
        // if there is already a session redirect to the home page
        if (_.has(this.$root, 'userStore.state.userId')) {
            this.$router.push('/');
        }
    },
    methods: {
        submit () {
            /* istanbul ignore next */
            var loginServiceInstance = this.getRequestService({
                    headers: {
                        'X-OpenIDM-NoSession': false,
                        'X-OpenIDM-Password': this.encodeRFC5987IfNecessary(this.password),
                        'X-OpenIDM-Username': this.encodeRFC5987IfNecessary(this.username)
                    }
                }),
                idmInstance = this.getRequestService({
                    headers: this.getAnonymousHeaders()
                });

            /* istanbul ignore next */
            idmInstance.post('/authentication?_action=logout').then(() => {
                loginServiceInstance.post('/authentication?_action=login').then((userDetails) => {
                    this.$root.userStore.clearStoreAction();

                    this.$root.userStore.setUserIdAction(userDetails.data.authorization.id);
                    this.$root.userStore.setManagedResourceAction(userDetails.data.authorization.component);
                    this.$root.userStore.setRolesAction(userDetails.data.authorization.roles);
                    // Check for progressive profiling.
                    this.progressiveProfileCheck(userDetails, () => {
                        axios.all([
                            loginServiceInstance.get(`${userDetails.data.authorization.component}/${userDetails.data.authorization.id}`),
                            loginServiceInstance.post(`privilege?_action=listPrivileges`),
                            loginServiceInstance.get(`schema/${userDetails.data.authorization.component}`)]).then(axios.spread((profile, privilege, schema) => {
                            this.$root.userStore.setProfileAction(profile.data);
                            this.$root.userStore.setSchemaAction(schema.data);
                            this.$root.userStore.setAccess(privilege.data);

                            window.history.pushState('', '', window.location.pathname);

                            this.completeLogin();
                        }))
                            .catch((error) => {
                                /* istanbul ignore next */
                                this.displayNotification('error', error.response.data.message);
                            });
                    });
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
