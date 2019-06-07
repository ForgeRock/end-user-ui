import _ from 'lodash';
import Vue from 'vue';
import i18n from '@/i18n';
import EditKBA from '@/components/profile/EditKBA';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import Sinon from 'sinon';

describe('EditKBA.vue', () => {
    let sandbox = null;

    Vue.use(BootstrapVue);

    beforeEach(function () {
        sandbox = Sinon.sandbox.create();

        sandbox.stub(EditKBA, 'mounted').callsFake(function () {
            _.noop();
        });
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('AccountSecurity page loaded', () => {
        const wrapper = shallowMount(EditKBA, {
            i18n
        });

        expect(wrapper.name()).to.equal('Edit-KBA');
    });

    it('creates fieldsets for the number of required questions', () => {
        const wrapper = shallowMount(EditKBA, {
            i18n
        });

        wrapper.vm.initializeForm(3);
        expect(wrapper.vm.selected.length).to.equal(3);

        wrapper.vm.selected = [];
        wrapper.vm.initializeForm(5);
        expect(wrapper.vm.selected.length).to.equal(5);
    });

    it('creates select options based on defined kba questions', () => {
        const wrapper = shallowMount(EditKBA, {
            i18n
        });

        // with no questions
        wrapper.vm.initializeForm(2);
        expect(wrapper.vm.selectOptions.length).to.equal(2);

        // with two questions added
        wrapper.setData({
            questions: {
                '1': {
                    'en': 'What\'s your favorite color?'
                },
                '2': {
                    'en': 'Who was your first employer?'
                }
            }
        });
        wrapper.vm.initializeForm(2);

        expect(wrapper.vm.selectOptions.length).to.equal(4);
    });

    describe('#generatePatch', () => {
        let wrapper;

        beforeEach(() => {
            wrapper = shallowMount(EditKBA, {
                i18n
            });
        });

        it('should correctly generate patches for custom questions', () => {
            wrapper.setData({ selected: [{ custom: 'test', answer: 'test answer' }] });

            let patch = wrapper.vm.generatePatch();

            expect(patch).to.be.an('Array');
            expect(patch.length).to.equal(1);
            expect(_.first(patch)).to.be.an('Object').with.property('value').that.deep.equals([{ answer: 'test answer', customQuestion: 'test' }]);
        });

        it('should correctly generate patches for provided questions', () => {
            wrapper.setData({ selected: [{ selected: 'test', answer: 'test answer' }] });

            let patch = wrapper.vm.generatePatch();

            expect(patch).to.be.an('Array');
            expect(patch.length).to.equal(1);
            expect(_.first(patch)).to.be.an('Object').with.property('value').that.deep.equals([{ answer: 'test answer', questionId: 'test' }]);
        });
    });
});
