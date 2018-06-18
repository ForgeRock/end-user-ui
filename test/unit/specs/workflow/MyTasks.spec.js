import Vue from 'vue';
import MyTasks from '@/components/widgets/workflow/MyTasks';
import VueI18n from 'vue-i18n';
import BootstrapVue from 'bootstrap-vue';
import translations from '@/translations';
import { mount } from '@vue/test-utils';

describe('WorkflowControlWidget.vue', () => {
    Vue.use(VueI18n);
    Vue.use(BootstrapVue);

    const i18n = new VueI18n({
        locale: 'en',
        messages: translations
    });

    it('My-Tasks', () => {
        const wrapper = mount(MyTasks, {
            i18n
        });

        expect(wrapper.name()).to.equal('My-Tasks');
    });
});
