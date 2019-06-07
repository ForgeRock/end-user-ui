<template>
    <b-form @submit.prevent id="kbaDefinition" class="mb-4">
        <fr-horizontal-rule v-if="inline" insert="<i class='fa fa-lock'></i>"></fr-horizontal-rule>

        <p class="text-center">{{$t('common.user.kba.description')}}</p>

        <fr-kba-form-group ref="kbaFormGroup" :selfServiceDetails="selfServiceDetails"></fr-kba-form-group>

        <b-button v-if="!inline" @click="save" :block="true" size="lg" variant="primary">{{$t("pages.selfservice.registration.completeRegistration")}}</b-button>
    </b-form>
</template>

<script>
import KBADefinitionFormGroup from '@/components/selfservice/common/KBADefinitionFormGroup';
import HorizontalRule from '@/components/utils/HorizontalRule';

/**
 * @description Selfservice stage that handles the initial KBA during registration functions the same in allinone
 *
 **/
export default {
    name: 'KBA-Security-Answer-Definition-Stage',
    props: {
        selfServiceDetails: { required: true },
        inline: {
            required: false,
            default: false
        }
    },
    components: {
        'fr-horizontal-rule': HorizontalRule,
        'fr-kba-form-group': KBADefinitionFormGroup
    },
    data () {
        return {};
    },
    methods: {
        getData () {
            return this.$refs.kbaFormGroup.getData();
        },

        save () {
            /* istanbul ignore next */
            this.isValid().then((valid) => {
                if (valid) {
                    this.$emit('advanceStage', this.getData());
                }
            });
        },
        isValid () {
            /* istanbul ignore next */
            return this.$refs.kbaFormGroup.isValid();
        }
    }
};
</script>

<style scoped>
</style>
