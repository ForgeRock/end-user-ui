<template>
    <fr-list-item :collapsible="true" :panelShown="false">
        <div slot="list-item-header" class="d-inline-flex w-100 media">
            <div class="media-body align-self-center">
                <h6>{{$t('pages.profile.accountSecurity.password')}}</h6>
            </div>
            <div class="d-flex ml-3 align-self-center">
                <div class="btn btn-sm btn-link float-right btn-cancel">{{$t('common.form.cancel')}}</div>
                <div class="btn btn-sm btn-link float-right btn-edit">{{$t('common.form.edit')}}</div>
            </div>
        </div>

        <div slot="list-item-collapse-body" class="d-inline-flex w-100">
            <b-form class="w-100">
                <b-row>
                    <b-col sm="8">
                        <b-form-group >
                            <label for="currentPassword">{{$t('pages.profile.accountSecurity.currentPassword')}}</label>
                            <div class="form-label-password form-label-group mb-0"> 
                                <b-form-input id="currentPassword" :type="inputCurrent" v-model="currentPassword"></b-form-input>
                                <div class="input-group-append">
                                    <button @click="revealCurrent" class="btn btn-secondary" type="button">
                                        <i :class="[{'fa-eye-slash': !showCurrent}, {'fa-eye': showCurrent}, 'fa']"></i>
                                    </button>
                                </div>
                            </div>
                        </b-form-group>

                        <b-form-group class="mb-3">
                            <label for="newPassword">{{$t('pages.profile.accountSecurity.newPassword')}}</label>
                            <div class="form-label-password form-label-group mb-0"> 
                                <b-form-input id="newPassword" :type="inputNew" v-model="newPassword"></b-form-input>
                                <div class="input-group-append">
                                    <button @click="revealNew" class="btn btn-secondary" type="button">
                                        <i :class="[{'fa-eye-slash': !showNew}, {'fa-eye': showNew}, 'fa']"></i>
                                    </button>
                                </div>
                            </div>
                        </b-form-group>

                        <fr-loading-button type="button" variant="primary" class="ld-ext-right mb-3" 
                            :label="$t('pages.profile.accountSecurity.savePassword')"
                            :loading="loading"
                            @click="onSavePassword"></fr-loading-button>

                        <div class="text-nowrap pb-2">{{$t('pages.profile.accountSecurity.rememberPassword')}} <a href="#/passwordReset">{{$t('pages.profile.accountSecurity.resetPassword')}}</a></div>
                    </b-col>
                </b-row>
            </b-form>
        </div>
    </fr-list-item>
</template>
<script>
    import ListItem from '@/components/utils/ListItem';
    import LoadingButton from '@/components/utils/LoadingButton';

    export default {
        name: 'Edit-Password',
        components: {
            'fr-list-item': ListItem,
            'fr-loading-button': LoadingButton
        },
        data () {
            return {
                currentPassword: '',
                newPassword: '',
                loading: false,
                showNew: true,
                showCurrent: true,
                inputCurrent: 'password',
                inputNew: 'password'
            };
        },
        methods: {
            onSavePassword () {
                /* istanbul ignore next */
                let userId = this.$root.userStore.getUserState().userId,
                    selfServiceInstance = this.getRequestService({
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest',
                            'X-OpenIDM-Reauth-Password': this.currentPassword
                        }
                    }),
                    patch = [{operation: 'add', field: '/password', value: this.newPassword}];

                this.loading = true;

                /* istanbul ignore next */
                selfServiceInstance.patch(`managed/user/${userId}`, patch).then((response) => {
                    this.currentPassword = '';
                    this.newPassword = '';

                    /* istanbul ignore next */
                    setTimeout(() => {
                        this.$notify({
                            group: 'IDMMessages',
                            type: 'success',
                            text: this.$t('common.user.profile.updateSuccess')
                        });

                        this.loading = false;
                    }, 1000);
                })
                .catch((error) => {
                    /* istanbul ignore next */
                    setTimeout(() => {
                        this.$notify({
                            group: 'IDMMessages',
                            type: 'error',
                            text: error.response.data.message
                        });

                        this.loading = false;
                    }, 1000);
                });
            },
            revealNew: function () {
                if (this.inputNew === 'password') {
                    this.inputNew = 'text';
                    this.showNew = false;
                } else {
                    this.inputNew = 'password';
                    this.showNew = true;
                }
            },
            revealCurrent: function () {
                /* istanbul ignore next */
                if (this.inputCurrent === 'password') {
                    this.inputCurrent = 'text';
                    this.showCurrent = false;
                } else {
                    this.inputCurrent = 'password';
                    this.showCurrent = true;
                }
            }
        }
    };
</script>

<style lang="scss" scoped>
    .form-label-password.form-label-group {
        display: flex;

        .form-control {
            flex-grow: 1;
            border-bottom-right-radius: 0;
            border-top-right-radius: 0;
        }

        .input-group-append {
            flex-grow: 1;

            button {
                border-bottom-left-radius: 0;
                border-top-left-radius: 0;
                background-color: $input-bg;
                border-color: $input-border-color;
                color:$input-btn-color;
            }
            button:hover {
              color: $input-btn-active-color;
            }

        }
    }

    .form-label-group {
        position: relative;
        margin-bottom: 1rem;
    }
</style>
