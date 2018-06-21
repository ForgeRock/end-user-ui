import Vue from 'vue';
import GroupTasks from '@/components/widgets/workflow/GroupTasks';
import VueI18n from 'vue-i18n';
import BootstrapVue from 'bootstrap-vue';
import translations from '@/translations';
import { mount } from '@vue/test-utils';

describe('GroupTasks.vue', () => {
    Vue.use(VueI18n);
    Vue.use(BootstrapVue);

    const i18n = new VueI18n({
        locale: 'en',
        messages: translations
    });

    it('Group-Tasks component loaded', () => {
        const wrapper = mount(GroupTasks, {
            i18n
        });

        expect(wrapper.name()).to.equal('Group-Tasks');
    });
});
