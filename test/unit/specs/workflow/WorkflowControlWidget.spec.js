import Vue from 'vue';
import WorkflowControl from '@/components/widgets/WorkflowControlWidget';
import VueI18n from 'vue-i18n';
import BootstrapVue from 'bootstrap-vue';
import translations from '@/translations';
import { shallow } from '@vue/test-utils';
import Sinon from 'sinon';

describe('WorkflowControlWidget.vue', () => {
    var sandbox = null;

    Vue.use(VueI18n);
    Vue.use(BootstrapVue);

    beforeEach(function () {
        sandbox = Sinon.sandbox.create();

        sandbox.stub(WorkflowControl, 'mounted').callsFake(function () {});
    });

    afterEach(function () {
        sandbox.restore();
    });

    const i18n = new VueI18n({
        locale: 'en',
        messages: translations
    });

    it('Workflow-Control-Widget', () => {
        const wrapper = shallow(WorkflowControl, {
            i18n
        });

        expect(wrapper.name()).to.equal('Workflow-Control-Widget');
    });
});
