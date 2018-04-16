<template>
    <div class="fr-all-in-one-container">
        <idmUserDetails v-if="stages.idmUserDetails" :inline="true" :selfServiceDetails="selfServiceDetails"></idmUserDetails>

        <TermsAndConditions v-if="stages.termsAndConditions" :inline="true" :selfServiceDetails="selfServiceDetails"></TermsAndConditions>

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

        <b-button @click="saveCheck" :block="true" variant="primary">
            {{$t("common.form.submit")}}
        </b-button>
    </div>
</template>

<script>
    import _ from 'lodash';
    import idmUserDetails from './UserDetails';
    import TermsAndConditions from './TermsAndConditions';
    import Consent from './Consent';

    export default {
        name: 'All-In-One-Registration',
        props: {
            selfServiceDetails: { required: true }
        },
        components: {
            idmUserDetails,
            TermsAndConditions,
            Consent
        },
        data: function () {
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
            getData: function () {
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

            saveCheck: function () {
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

            save: function () {
                this.$emit('saveSelfService', this.getData());
            },

            isValid: function () {
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