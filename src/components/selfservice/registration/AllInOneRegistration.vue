<template>
    <div class="fr-all-in-one-container">

        <idmUserDetails v-if="stages.idmUserDetails" :inline="true" :selfServiceDetails="selfServiceDetails"></idmUserDetails>
        <kbaSecurityAnswerDefinitionStage v-if="stages.kbaSecurityAnswerDefinitionStage" :inline="true" :selfServiceDetails="selfServiceDetails"></KBASecurityAnswerDefinitionStage>
        <Captcha v-if="stages.captcha" :self-service-details="selfServiceDetails"></Captcha>

        <template v-if="stages.consent">
            <b-modal ref="consentModal"
                     :title="$t('pages.selfservice.registration.consent.title')">

                <Consent :inline="true" :selfServiceDetails="selfServiceDetails"></Consent>

                <b-form-checkbox plain v-model="consentCheck"
                                 :value="false"
                                 :unchecked-value="true">
                    {{$t("pages.selfservice.registration.consent.agreement")}}
                </b-form-checkbox>

                <div slot="modal-footer" class="w-100">
                    <b-btn :disabled="consentCheck" size="sm" class="float-right" variant="primary" @click="save">
                        Okay
                    </b-btn>
                </div>
            </b-modal>
        </template>

        <b-button @click="saveCheck" :block="true" variant="primary" class="mt-2 mb-3">
            {{$t("common.form.signUp")}}
        </b-button>
        <TermsAndConditions v-if="stages.termsAndConditions" :inline="true" :selfServiceDetails="selfServiceDetails"></TermsAndConditions>
    </div>
</template>

<script>
    import _ from 'lodash';
    import idmUserDetails from './UserDetails';
    import Captcha from '../common/Captcha';
    import kbaSecurityAnswerDefinitionStage from './KBASecurityAnswerDefinitionStage';
    import TermsAndConditions from './TermsAndConditions';
    import Consent from './Consent';

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
            Captcha
        },
        data () {
            var data = {
                stages: {},
                consentCheck: true
            };

            _.each(this.selfServiceDetails.requirements.stages, (name) => {
                data.stages[name] = true;
            });

            return data;
        },
        methods: {
            getData () {
                var data = {};

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
            },

            isValid () {
                var childChecks = [],
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
                                resolve({'success': true});
                            }
                        });
                    });

                return validPromise;
            }
        }
    };
</script>

<style scoped></style>