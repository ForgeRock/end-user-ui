<template>
    <div class="fr-all-in-one-container">

        <idmUserDetails v-if="stages.idmUserDetails" :inline="true" :selfServiceDetails="selfServiceDetails"></idmUserDetails>
        <kbaSecurityAnswerDefinitionStage v-if="stages.kbaSecurityAnswerDefinitionStage" :inline="true" :selfServiceDetails="selfServiceDetails"></KBASecurityAnswerDefinitionStage>
        <Captcha v-if="stages.captcha" :self-service-details="selfServiceDetails"></Captcha>

        <template v-if="stages.consent && selfServiceDetails.requirements && selfServiceDetails.requirements.consent">
            <b-modal ref="consentModal"
                     :title="$t('pages.selfservice.registration.consent.title')"
                     @hide="loading = false;">

                <Consent :inline="true" :selfServiceDetails="selfServiceDetails"></Consent>

                <b-form-checkbox plain v-model="consentCheck"
                                 :value="false"
                                 :unchecked-value="true">
                    {{$t("pages.selfservice.registration.consent.agreement")}}
                </b-form-checkbox>

                <div slot="modal-footer" class="w-100">
                    <b-btn :disabled="consentCheck" size="sm" class="float-right" variant="primary" @click="save">
                        {{$t("common.form.okay")}}
                    </b-btn>
                </div>
            </b-modal>
        </template>

        <fr-loading-button type="button" variant="primary" class="mt-2 mb-3 btn-lg btn-block"
                           :label="$t('common.form.signUp')"
                           :loading="loading"
                           :large="true"
                           @click="saveCheck"></fr-loading-button>

        <TermsAndConditions v-if="stages.termsAndConditions && selfServiceDetails.requirements && selfServiceDetails.requirements.terms" :inline="true" :selfServiceDetails="selfServiceDetails"></TermsAndConditions>
    </div>
</template>

<script>
import _ from 'lodash';
import Captcha from '../common/Captcha';
import Consent from './Consent';
import idmUserDetails from './UserDetails';
import kbaSecurityAnswerDefinitionStage from './KBASecurityAnswerDefinitionStage';
import LoadingButton from '@/components/utils/LoadingButton';
import TermsAndConditions from './TermsAndConditions';

/**
 * @description Selfservice stage that is used for combing multiple selfservice stages (User details, Captcha, KBA, Terms and Confitions and Consent)
 *
 **/
export default {
    name: 'All-In-One-Registration',
    props: {
        selfServiceDetails: { required: true }
    },
    components: {
        idmUserDetails,
        kbaSecurityAnswerDefinitionStage,
        TermsAndConditions,
        Consent,
        Captcha,
        'fr-loading-button': LoadingButton
    },
    data () {
        let data = {
            stages: {},
            consentCheck: true,
            loading: false
        };

        _.each(this.selfServiceDetails.requirements.stages, (name) => {
            data.stages[name] = true;
        });

        return data;
    },
    methods: {
        getData () {
            let data = {};

            /* istanbul ignore next */
            _.each(this.$children, (child) => {
                let childData = {};

                if (child.getData) {
                    childData = child.getData();
                }

                data = _.merge(data, childData);
            });

            if (this.selfServiceDetails.requirements.consentEnabled) {
                data.consentGiven = 'true';
            }

            return data;
        },

        saveCheck () {
            this.loading = true;

            if (this.selfServiceDetails.requirements.consentEnabled) {
                this.isValid().then(() => {
                    this.$refs.consentModal.show();
                });
            } else {
                /* istanbul ignore next */
                this.isValid().then(() => {
                    this.save();
                });
            }
        },

        save () {
            this.$emit('advanceStage', this.getData());
            this.loading = false;
        },

        isValid () {
            let childChecks = [],
                validPromise = new Promise((resolve, reject) => {
                    if (this.$children) {
                        _.each(this.$children, (child, index) => {
                            /* istanbul ignore next */
                            if (this.$children[index].isValid) {
                                childChecks.push(this.$children[index].isValid());
                            }
                        });
                    }

                    Promise.all(childChecks).then((results) => {
                        let validCheck = true;

                        _.each(results, (check) => {
                            /* istanbul ignore next */
                            if (check === false) {
                                validCheck = false;
                            }
                        });

                        if (validCheck) {
                            resolve({ 'success': true });
                        } else {
                            this.displayNotification('error', this.$t('pages.selfservice.registration.pleaseComplete'));
                            this.loading = false;
                        }
                    });
                });

            return validPromise;
        }
    }
};
</script>

<style scoped></style>
