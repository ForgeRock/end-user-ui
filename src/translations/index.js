export default
{
    en: {
        common: {
            errors: {
                notFound: 'Not Found',
                notFoundAdditional: 'Please send help'
            },
            form: {
                submit: 'Submit',
                agree: 'I Agree',
                logo: 'logo',
                signUp: 'Sign Up',
                cancel: 'Cancel',
                saveChanges: 'Save changes',
                edit: 'Edit',
                save: 'Save'
            },
            placeholders: {
                password: 'Password',
                retypePassword: 'Retype Password',
                emailAddress: 'Email address'
            },
            user: {
                profile: {
                    updateSuccess: 'Successfully updated your profile.'
                },
                kba: {
                    description: 'Select security question(s) below. These questions will help us verify your identity if you forget your password.',
                    selectQuestion: 'Select a security question...',
                    custom: 'Provide your own:',
                    question: 'Question',
                    answer: 'Answer',
                    saveQuestions: 'Save questions'
                }
            },
            policyValidationMessages: {
                'MIN_LENGTH': 'Must be {minLength} characters long',
                'AT_LEAST_X_CAPITAL_LETTERS': 'Must have at least {numCaps} capital letter(s)',
                'AT_LEAST_X_NUMBERS': 'Must have at least {numNums} number(s)',
                'CANNOT_CONTAIN_OTHERS': 'Must not share characters with {disallowedFields}',
                'test': 'succeed',
                policyServiceError: {
                    registration: 'Unable to register. Please try again later.',
                    reset: 'Unable to reset your password. Please try again later.'
                },
                successMessages: {
                    password: 'Your password is secure!'
                }
            }
        },
        pages: {
            app: {
                profile: 'Profile',
                dashboard: 'Dashboard',
                user: 'User',
                signOut: 'Sign Out'
            },
            dashboard: {
                noWidget: 'No Widgets Available',
                noWidgetSubText: 'Don\'t worry, you still have a <a href="/#/profile">profile</a>.',
                widgets: {
                    welcome: {
                        greeting: 'Hello',
                        welcomeMessage: 'The ForgeRock End User UI helps users manage their account data, consent, workflows, and shared resources.',
                        editProfile: 'Edit Your Profile'
                    }
                }
            },
            login: {
                username: 'Username',
                password: 'Password',
                signIn: 'Sign In',
                newHere: 'New here?',
                createAccount: 'Create an account',
                badPassword: "Sorry, that password isn't right. We can help you ",
                recoverPassword: 'recover your password.',
                forgotUsername: 'Forgot username?',
                forgotPassword: 'Forgot password?'
            },
            selfservice: {
                signIn: 'Sign in',
                headers: {
                    username: {
                        title: 'Recover Your Username',
                        description: 'You can recover your username with the email address associated with your account.'
                    },
                    reset: {
                        title: 'Reset Password',
                        description: 'We will send you an email with instructions on how to reset your password',
                        emailSent: 'An email has been sent to your inbox with instructions on how to reset your password.'
                    }
                },
                registration: {
                    signUp: 'Sign Up',
                    haveAccount: 'Already have an account?',
                    signIn: 'Sign in',
                    signUpMsg: 'Signing up is fast and easy.',
                    createdAccount: 'User account has been created.',
                    termsAndConditions: {
                        title: 'Terms & Conditions',
                        singlePage: 'By clicking "Sign Up" you agree to our '
                    },
                    consent: {
                        title: 'Privacy & Consent',
                        agreement: 'I agree'
                    },
                    emailValidation: 'An email has been sent to the address you entered. Click the link in that email to proceed.'
                },
                forgotUsername: {
                    advanceStageButtonText: 'Recover Username',
                    yourUsername: 'Your username is',
                    unableToRetrieve: 'Unable to retrieve your username',
                    tryAgain: 'Try finding your username again',
                    emailSent: 'An email containing your username has been sent to your account.'
                },
                passwordReset: {
                    advanceStageButtonText: 'Send Reset Instructions',
                    tryAgain: 'Try resetting your password again',
                    errorMessage: 'Error resetting your password',
                    successMessage: 'Your password has been reset.',
                    newPassword: 'New password',
                    changePassword: 'Change Password'
                },
                progressiveProfile: {
                    skipThis: 'Skip this'
                }
            },
            profile: {
                editPersonalInfo: 'Edit personal info',
                settings: 'Settings',
                activity: 'Activity',
                accountControls: {
                    title: 'Account Controls',
                    subtitle: 'Download your account data or delete your account.',
                    deleteTitle: 'Delete your account',
                    deleteSubtitle: 'Permanently delete your account.',
                    deleteAccount: 'Delete Account',
                    deleteModalTitle: 'Delete your account',
                    deleteModalHeader: 'Please read this carefully.',
                    deleteModalDetails: 'You\'re trying to delete your account, which provides access to various services. You\'ll\n no longer be able to use any of those services, and your account and data will be lost.',
                    deleteModalDownload1: 'You can',
                    deleteModalDownload2: 'download your data',
                    deleteModalDownload3: 'before deleting your account.',
                    deleteModalContentList: 'The following content will be deleted.',
                    deleteModalContentListItem: 'Access to your profile',
                    deleteModalAcceptMessage: 'Yes, I want to permanently delete my account',
                    deleteModalButton: 'Delete Account',
                    deleteAccountSuccessful: 'Successfully deleted your account.',
                    downloadTitle: 'Download your data',
                    downloadSubtitle: 'Download your account data.',
                    downloadLink: 'Download'
                },
                preferences: {
                    title: 'Preferences',
                    subtitle: 'Set your communications preferences.'
                },
                editProfile: {
                    userDetailsTitle: 'Edit your personal info'
                },
                accountSecurity: {
                    title: 'Account Security',
                    subtitle: 'Update your username, password or security questions to secure your account.',
                    'password': 'Password',
                    'securityQuestions': 'Security Questions',
                    'rememberPassword': 'Can\'t remember your current password?',
                    'resetPassword': 'Reset your password',
                    'savePassword': 'Save password',
                    'custom': 'Custom',
                    'currentPassword': 'Current password',
                    'newPassword': 'New password'
                },
                consent: {
                    allow: 'Allow',
                    allowConsentHeader: 'Allow Access',
                    accessType: 'Access Type',
                    accountAccess: 'Account Access',
                    authorized: 'Authorized',
                    confirmDeny: '<strong>{mappingName}</strong> will no longer have access to your data.',
                    deny: 'Deny',
                    denyConsentHeader: 'Deny Access',
                    notAuthorized: 'Not Authorized',
                    subtitle: 'Control how your data is shared with third parties.',
                    title: 'Personal Data Sharing'
                }
            }
        }
    }
};
