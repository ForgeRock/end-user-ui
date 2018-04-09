<template>
    <fr-center-card :showLogo="true">
        <div slot="center-card-header">
            <h2 class="h2">{{$t('pages.login.signIn')}}</h2>
        </div>

        <b-card-body slot="center-card-body">
            <transition name="slide-fade">
                <div v-if="wrongPasswordSubmitted" class="alert alert-danger mb-4 text-left" role="alert">
                    {{$t('pages.login.badPassword')}}
                    <a href="#/registration" class="alert-link">
                        {{$t('pages.login.recoverPassword')}}
                    </a>
                </div>
            </transition>

            <b-form class="form-signin" @submit.prevent="submit">

                <fr-floating-label-input v-model="username" :label="$t('pages.login.username')" type="text" autofocus="true"></fr-floating-label-input>
                <fr-floating-label-input v-model="password" :label="$t('pages.login.password')" type="password"></fr-floating-label-input>

                <b-button type="submit" variant="primary" class="btn btn-block btn-lg">
                    {{$t('pages.login.signIn')}}
                </b-button>
            </b-form>
        </b-card-body>

        <b-card-footer slot="center-card-footer">
            {{$t('pages.login.newHere')}}
            <a href="#/registration">
                {{$t('pages.login.createAccount')}}
            </a>
        </b-card-footer>
    </fr-center-card>
</template>

<script>
    import FloatingLabelInput from '@/components/utils/FloatingLabelInput';
    import CenterCard from '@/components/utils/CenterCard';

    export default {
        name: 'Login',
        components: {
            'fr-floating-label-input': FloatingLabelInput,
            'fr-center-card': CenterCard
        },
        data: function () {
            return {
                username: '',
                password: '',
                wrongPasswordSubmitted: false
            };
        },
        methods: {
            submit: function () {
                /* istanbul ignore next */
                var loginServiceInstance = this.getRequestService({
                        headers: {
                            'X-OpenIDM-NoSession': false,
                            'X-OpenIDM-Password': this.password,
                            'X-OpenIDM-Username': this.username
                        },
                        timeout: 5000
                    }),
                    idmInstance = this.getRequestService();

                /* istanbul ignore next */
                idmInstance.post('/authentication?_action=logout').then(() => {
                    loginServiceInstance.post('/authentication?_action=login').then(() => {
                        this.$router.push('/');
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