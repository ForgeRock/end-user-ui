<template>
    <div id="captchaBody" class="mb-4">
        <p v-if="apiType" class="text-center mb-4">
            {{ $t(`pages.selfservice.headers.${apiType}.description`) }}
        </p>
        <div class="recaptcha-wrapper ">
            <div class="recaptcha-bound">
                <div id="recaptchaContainer" />
            </div>
        </div>
    </div>
</template>

<script>

/**
 * @description Selfservice stage for multiple selfservice flows, displays a google captcha
 */
import { isUndefined } from "lodash";

export default {
    "name": "Captcha",
    // eslint-disable-next-line sort-keys
    created () {
        const recaptchaScript = document.createElement("script");

        recaptchaScript.setAttribute("src", "https://www.google.com/recaptcha/api.js");
        document.head.append(recaptchaScript);
    },
    "methods": {
        getData () {
            return {
                "g-recaptcha-response": this.recaptchaResponse,
                "response": this.recaptchaResponse
            };
        },
        handleCaptchaCallback (response) {
            this.recaptchaResponse = response;
            /* istanbul ignore next */
            if (this.$listeners.advanceStage) {
                this.$emit("advanceStage", this.getData());
            }
        },
        loadRecaptcha () {
            /* istanbul ignore next */
            if (isUndefined(this.selfServiceDetails.requirements.properties.response.recaptchaSiteKey) || this.selfServiceDetails.requirements.properties.response.recaptchaSiteKey.length === 0) {
                this.displayNotification("error", this.$t("pages.selfservice.captchaError"));
            } else {
                setTimeout(() => {
                    if (typeof window.grecaptcha === "undefined") {
                        this.loadRecaptcha();
                    } else {
                        window.grecaptcha.render("recaptchaContainer", {
                            "callback": this.handleCaptchaCallback,
                            "sitekey": this.selfServiceDetails.requirements.properties.response.recaptchaSiteKey
                        });
                    }
                }, 500);
            }
        }
    },
    mounted () {
        this.loadRecaptcha();
    },
    "props": {
        "advanceStage": { "required": false },
        "apiType": { "required": false },
        "selfServiceDetails": { "required": true }
    }
};
</script>
