import Vue from 'vue';
import KBASecurityAnswerDefinitionStage from '@/components/selfservice/common/KBADefinitionFormGroup';
import i18n from '@/i18n';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { mount, shallowMount } from '@vue/test-utils';
import VeeValidate from 'vee-validate';

describe('KBADefinitionFormGroup Component', () => {
    Vue.use(BootstrapVue);
    Vue.use(VeeValidate, { inject: false, fastExit: false });

    const v = new VeeValidate.Validator();

    let wrapper,
        mountOptions = {
            provide: () => ({
                $validator: v
            }),
            i18n,
            propsData: {
                selfServiceDetails: {
                    requirements: {
                        properties: {
                            kba: {
                                minItems: 4,
                                questions: [
                                    {
                                        question: {
                                            en: 'What\'s your favorite color?'
                                        },
                                        id: '1'
                                    },
                                    {
                                        question: {
                                            en: 'Who was your first employer?'
                                        },
                                        id: '2'
                                    }
                                ]
                            }
                        }
                    }
                }
            }
        };

    beforeEach(() => {
        wrapper = mount(KBASecurityAnswerDefinitionStage, mountOptions);
    });

    it('KBASecurityAnswerDefinitionStage component loaded', () => {
        expect(wrapper.name()).to.equal('KBA-Definition-Form-Group');
    });

    it('creates the correct number of selects and inputs', () => {
        expect(wrapper.findAll('select').length).to.equal(4);
        expect(wrapper.findAll('input').length).to.equal(4);
    });

    it('disables questions when they are selected', () => {
        // choose first value in select
        wrapper.vm.answers[0].questionId = '1';
        expect(wrapper.vm.options[1].disabled).to.equal(true);
        wrapper.vm.answers[1].questionId = '2';
        expect(wrapper.vm.options[2].disabled).to.equal(true);
    });

    it('adds "question" input when custom option is selected', () => {
        // choose "custom" option in select
        const select = wrapper.find('select').element;

        select.value = wrapper.vm.customIndex;
        select.dispatchEvent(new Event('change'));

        expect(wrapper.findAll('input[name="question0"]').length).to.equal(1);
    });

    it('correctly formats save object', () => {
        let options = Object.assign({}, mountOptions, { stubs: ['BFormSelect'] }),
            wrapper = shallowMount(KBASecurityAnswerDefinitionStage, options),
            data;

        wrapper.vm.answers = [
            {
                answer: 'eggs',
                questionId: wrapper.vm.customIndex,
                customQuestion: 'What\'s your favorite food'
            },
            {
                answer: 'red',
                questionId: '1'
            },
            {
                answer: 'main',
                questionId: wrapper.vm.customIndex,
                customQuestion: 'What street did you grow up on?'
            },
            {
                answer: 'google',
                questionId: '2'
            }
        ];

        data = wrapper.vm.getData();

        expect(data).to.be.an('object')
            .and.to.have.property('kba').that.is.an('array');
        expect(data.kba[0]).to.deep.equal({
            answer: 'eggs',
            customQuestion: 'What\'s your favorite food'
        });
        expect(data.kba[1]).to.deep.equal({
            questionId: '1',
            answer: 'red'
        });
        expect(data.kba[2]).to.deep.equal({
            answer: 'main',
            customQuestion: 'What street did you grow up on?'
        });
        expect(data.kba[3]).to.deep.equal({
            questionId: '2',
            answer: 'google'
        });
    });

    it('allows selecting defined questions', () => {
        wrapper = mount(KBASecurityAnswerDefinitionStage, {
            i18n,
            provide: () => ({
                $validator: v
            }),
            propsData: {
                selfServiceDetails: {
                    requirements: {
                        properties: {
                            kba: {
                                minItems: 2,
                                questions: [
                                    {
                                        question: {
                                            en: 'What\'s your favorite color?'
                                        },
                                        id: '1'
                                    },
                                    {
                                        question: {
                                            en: 'Who was your first employer?'
                                        },
                                        id: '2'
                                    }
                                ]
                            }
                        }
                    }
                }
            }
        });

        // select defined questions
        wrapper.vm.selected = [
            { selected: '1' },
            { selected: '2' }
        ];

        // inputs should match the number of questions selected
        expect(wrapper.findAll('input').length).to.equal(2);
        // should not find a 'question' input
        expect(wrapper.findAll('input[name="question"]').length).to.equal(0);
    });

    it('should get duplicates from custom question text and defined questions', () => {
        wrapper = shallowMount(KBASecurityAnswerDefinitionStage, mountOptions);

        wrapper.vm.answers = [
            {
                answer: 'test answer 1',
                questionId: null,
                customQuestion: 'test question 1'
            },
            {
                answer: 'test answer 2',
                questionId: null,
                customQuestion: 'test question 2'
            },
            {
                answer: 'test answer 3',
                questionId: null,
                customQuestion: 'test question 3'
            }
        ];

        expect(wrapper.vm.getDuplicates(0)).to.deep.equal(
            ['test question 2', 'test question 3', 'What\'s your favorite color?', 'Who was your first employer?']
        );
        expect(wrapper.vm.getDuplicates(1)).to.deep.equal(
            ['test question 1', 'test question 3', 'What\'s your favorite color?', 'Who was your first employer?']
        );
        expect(wrapper.vm.getDuplicates(2)).to.deep.equal(
            ['test question 1', 'test question 2', 'What\'s your favorite color?', 'Who was your first employer?']
        );
    });
});
