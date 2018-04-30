<template>
    <b-alert show>
        {{$t(`pages.selfservice.headers.${apiType}.emailSent`)}}
    </b-alert>
</template>

<script>
    export default {
        name: 'Email-Validation',
        props: {
            apiType: { required: true }
        }
    };
</script>
