<template>
    <div id="captchaBody">
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
                setTimeout(() => {
                    if (typeof window.grecaptcha === 'undefined') {
                        this.loadRecaptcha();
                    } else {
                        window.grecaptcha.render('recaptchaContainer', {
                            sitekey: this.selfServiceDetails.requirements.properties.response.recaptchaSiteKey,
                            callback: this.handleCaptchaCallback
                        });
                    }
                }, 100);
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