<template>
    <div class="fr-all-in-one-container">
        <idmUserDetails v-show="stages.idmUserDetails" :selfServiceDetails="selfServiceDetails"></idmUserDetails>

        <TermsAndConditions v-show="stages.termsAndConditions" :inline="true" :selfServiceDetails="selfServiceDetails"></TermsAndConditions>
    </div>
</template>

<script>
    import _ from 'lodash';
    import idmUserDetails from './UserDetails';
    import TermsAndConditions from './TermsAndConditions';

    export default {
        name: 'All-In-One-Registration',
        props: {
            selfServiceDetails: { required: true }
        },
        components: {
            idmUserDetails,
            TermsAndConditions
        },
        data: function () {
            var data = {
                stages: {}
            };

            _.each(this.selfServiceDetails.requirements.stages, (name) => {
                data.stages[name] = true;
            });

            return data;
        },
        methods: {
            getData: function () {
                var data = {};

                _.each(this.$children, (child) => {
                    let childData = {};

                    if (child.getData) {
                        childData = child.getData();
                    }

                    data = _.merge(data, childData);
                });

                return data;
            },
            isValid: function () {
                var childChecks = [],
                    validPromise = new Promise((resolve, reject) => {
                        if (this.$children) {
                            _.each(this.$children, (child, index) => {
                                if (this.$children[index].isValid) {
                                    childChecks.push(this.$children[index].isValid());
                                }
                            });
                        }

                        Promise.all(childChecks).then((results) => {
                            let validCheck = true;

                            _.each(results, (check) => {
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

<style scoped>

</style>