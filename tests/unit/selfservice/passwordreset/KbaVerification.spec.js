import Vue from 'vue';
import KbaVerification from '@/components/selfservice/passwordreset/KbaVerification';
import i18n from '@/i18n';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import VeeValidate from 'vee-validate';

describe('KbaVerification.vue', () => {
    Vue.use(BootstrapVue);

    const v = new VeeValidate.Validator();

    let wrapper;

    beforeEach(() => {
        wrapper = shallowMount(KbaVerification, {
            provide: () => ({
                $validator: v
            }),
            i18n,
            propsData: {
                selfServiceDetails: response
            }
        });
    });

    describe('Proper rendering', () => {
        it('should create a input for each required answer', () => {
            expect(wrapper.findAll('input').length).to.equal(response.requirements.required.length);
        });

        it('should use "userQuestion" for label text', () => {
            expect(wrapper.find('label[for="answer1"]').text()).to.equal('hello');
        });

        it('should use proper locale text to label "systemQuestion"', () => {
            let answer2Config = response.requirements.properties.answer2;

            expect(wrapper.find('label[for="answer2"]').text()).to.equal(answer2Config.systemQuestion.en);
        });
    });

    describe('data', () => {
        beforeEach(() => {
            ['answer1', 'answer2'].forEach((answer, i) => {
                let el = wrapper.find(`#${answer}`).element;

                el.value = `test value: ${i}`;
                el.dispatchEvent(new Event('input'));
            });
        });

        it('should return current value when #getData called', () => {
            let data = wrapper.vm.getData();

            expect(data).to.have.property('answer1').that.equals('test value: 0');
            expect(data).to.have.property('answer2').that.equals('test value: 1');
        });

        it('should emit "advanceStage" with `getData` value when #emitValue called', () => {
            let emittedValue;

            wrapper.vm.emitData();
            [ emittedValue ] = wrapper.emitted('advanceStage')[0];

            expect(wrapper.emitted('advanceStage').length).to.equal(1);
            expect(emittedValue).to.have.property('answer1').that.equals('test value: 0');
            expect(emittedValue).to.have.property('answer2').that.equals('test value: 1');
        });
    });
});

const response = {
    'requirements': {
        'required': [
            'answer1',
            'answer2'
        ],
        'properties': {
            'answer2': {
                'systemQuestion': {
                    'en': 'What\'s your favorite color?',
                    'en_GB': 'What is your favourite colour?',
                    'fr': 'Quelle est votre couleur préférée?'
                },
                'type': 'string'
            },
            'answer1': {
                'userQuestion': 'hello',
                'type': 'string'
            }
        }
    }
};
