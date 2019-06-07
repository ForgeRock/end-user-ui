<template>
    <fr-kba-form-group ref="kbaFormGroup" :selfServiceDetails="selfServiceDetails"></fr-kba-form-group>
</template>

<script>
import KBADefinitionFormGroup from '@/components/selfservice/common/KBADefinitionFormGroup';

/**
 * @description Selfservice stage for progressive profile, handles the case where a resource is requested to change their KBA questions
 *
 **/
export default {
    name: 'KBA-Update-Stage',
    props: {
        selfServiceDetails: { required: true },
        inline: {
            required: false,
            default: false
        }
    },
    components: {
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
