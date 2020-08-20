<template>
    <div id="captchaBody" class="mb-4">
        <p class='text-center mb-4' v-if="apiType">
            {{$t(`pages.selfservice.headers.${apiType}.description`)}}
        </p>
        <div class="recaptcha-wrapper ">
            <div class="recaptcha-bound">
                <div id="recaptchaContainer"></div>
            </div>
        </div>
    </div>
</template>

<script>
/**
 * @description Selfservice stage for multiple selfservice flows, displays a google captcha
 *
 **/
import _ from 'lodash';

export default {
    name: 'Captcha',
    props: {
        advanceStage: { required: false },
        selfServiceDetails: { required: true },
        apiType: { required: false }
    },
    created () {
        let recaptchaScript = document.createElement('script');

        recaptchaScript.setAttribute('src', 'https://www.google.com/recaptcha/api.js');
        document.head.appendChild(recaptchaScript);
    },
    mounted () {
        this.loadRecaptcha();
    },
    methods: {
        loadRecaptcha () {
            /* istanbul ignore next */
            if (_.isUndefined(this.selfServiceDetails.requirements.properties.response.recaptchaSiteKey) || this.selfServiceDetails.requirements.properties.response.recaptchaSiteKey.length === 0) {
                this.displayNotification('error', this.$t('pages.selfservice.captchaError'));
            } else {
                setTimeout(() => {
                    if (typeof window.grecaptcha === 'undefined') {
                        this.loadRecaptcha();
                    } else {
                        window.grecaptcha.render('recaptchaContainer', {
                            sitekey: this.selfServiceDetails.requirements.properties.response.recaptchaSiteKey,
                            callback: this.handleCaptchaCallback
                        });
                    }
                }, 500);
            }
        },
        handleCaptchaCallback (response) {
            this.recaptchaResponse = response;
            /* istanbul ignore next */
            if (this.$listeners.advanceStage) {
                this.$emit('advanceStage', this.getData());
            }
        },
        getData () {
            return {
                response: this.recaptchaResponse,
                'g-recaptcha-response': this.recaptchaResponse
            };
        }
    }
};
</script>
