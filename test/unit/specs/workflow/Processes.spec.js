import Vue from 'vue';
import Processes from '@/components/widgets/workflow/Processes';
import VueI18n from 'vue-i18n';
import BootstrapVue from 'bootstrap-vue';
import translations from '@/translations';
import { shallow } from '@vue/test-utils';

describe('WorkflowControlWidget.vue', () => {
    Vue.use(VueI18n);
    Vue.use(BootstrapVue);

    const i18n = new VueI18n({
        locale: 'en',
        messages: translations
    });

    it('Workflow-Control-Widget', () => {
        const wrapper = shallow(Processes, {
            i18n
        });

        expect(wrapper.name()).to.equal('Processes');
    });
});
