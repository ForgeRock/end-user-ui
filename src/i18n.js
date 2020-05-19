import Vue from "vue";
import VueI18n from "vue-i18n";

Vue.use(VueI18n);

const loadLocaleMessages = function () {
    const locales = require.context("./locales", true, /[\s\w,-]+\.json$/iu),
        messages = {};
    locales.keys().forEach((key) => {
        // eslint-disable-next-line prefer-named-capture-group
        const matched = key.match(/([\w-]+)\./iu);
        if (matched && matched.length > 1) {
            // eslint-disable-next-line prefer-destructuring
            const locale = matched[1];
            messages[locale] = locales(key);
        }
    });
    return messages;
};

export default new VueI18n({
    // eslint-disable-next-line no-process-env
    "fallbackLocale": process.env.VUE_APP_I18N_FALLBACK_LOCALE || "en",
    // eslint-disable-next-line no-process-env
    "locale": process.env.VUE_APP_I18N_LOCALE || "en",
    "messages": loadLocaleMessages()
});
