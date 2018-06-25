export default
{
    en: {
        common: {
            form: {
                submit: 'Submit',
                agree: 'I Agree',
                logo: 'logo',
                signUp: 'Sign Up',
                cancel: 'Cancel',
                saveChanges: 'Save changes',
                edit: 'Edit',
                save: 'Save',
                remove: 'Remove',
                confirm: 'Confirm'
            },
            placeholders: {
                password: 'Password',
                retypePassword: 'Retype Password',
                emailAddress: 'Email address'
            },
            user: {
                profile: {
                    updateSuccess: 'Updated your profile.'
                },
                sharing: {
                    shareSuccess: 'Shared your resource.',
                    unshareSuccess: 'Unshared your resource.',
                    modifySuccess: 'Modified resource permissions',
                    requestAllowedSuccess: 'Access granted',
                    requestDeniedSuccess: 'Access denied'
                },
                kba: {
                    description: 'Select security question(s) below. These questions will help us verify your identity if you forget your password.',
                    selectQuestion: 'Select a security question...',
                    custom: 'Provide your own:',
                    question: 'Question',
                    answer: 'Answer',
                    saveQuestions: 'Save questions',
                    submitAnswers: 'Verify Answer | Verify Answers'
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
                sharing: 'Sharing',
                user: 'User',
                signOut: 'Sign Out',
                notifications: {
                    noNotifications: 'No notifications available',
                    title: 'Notifications',
                    clearAll: 'Clear All',
                    removedAll: 'Removed all notifications',
                    removed: 'Removed notification',
                    failedToRemove: 'Failed to remove notification',
                    failedToClear: 'Failed to clear all notifications'
                }
            },
            notFound: {
                couldNotFind: 'We couldn\'t find the page you were looking for.',
                returnToDashboard: 'Return to dashboard'
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
                badPassword: "Sorry, that password isn't right.",
                weCanHelp: 'We can help you',
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
                    emailValidation: 'An email has been sent to the address you entered. Click the link in that email to proceed.',
                    completeRegistration: 'Complete Registration',
                    stageTitle: {
                        captcha: 'Verify You\'re Human',
                        consent: '',
                        emailValidation: '',
                        kbaSecurityAnswerDefinitionStage: 'Create Security Questions',
                        termsAndConditions: ''
                    },
                    stageSubtitle: {
                        captcha: 'No robots allowed',
                        consent: '',
                        emailValidation: '',
                        kbaSecurityAnswerDefinitionStage: '',
                        termsAndConditions: ''
                    }
                },
                accountClaiming: {
                    title: 'You have an existing account',
                    passwordDesc: 'To continue, please sign in with you email <strong>{account}</strong> to link accounts.',
                    socialDesc: 'To continue, please sign in to your {providers} account to link accounts.',
                    link: 'Link Accounts',
                    return: 'Back to sign in',
                    linked: 'Accounts Linked!',
                    error: 'Unable to link accounts'
                },
                forgotUsername: {
                    advanceStageButtonText: 'Recover Username',
                    yourUsername: 'Your username is',
                    unableToRetrieve: 'Unable to retrieve your username',
                    tryAgain: 'Try finding your username again',
                    emailSent: 'An email containing your username has been sent to your account.'
                },
                passwordReset: {
                    userQuery: 'Enter email to retrieve account details',
                    advanceStageButtonText: 'Retrieve Account',
                    tryAgain: 'Try resetting your password again',
                    errorMessage: 'Error resetting your password',
                    successMessage: 'Your password has been reset.',
                    newPassword: 'New password',
                    changePassword: 'Change Password',
                    kbaVerificationStageDescription: 'Verify your identity by answering security questions'
                },
                progressiveProfile: {
                    skipThis: 'Skip this'
                },
                social: {
                    signIn: 'Sign in with',
                    signUp: 'Sign up with',
                    or: 'or'
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
                oauthApplications: {
                    title: 'Authorized Applications',
                    subtitle: 'These apps can access your account.',
                    removeConfirmation: 'Are you sure you want to remove "{applicationName}" from your list of authorized applications?',
                    removeSuccess: '"{applicationName}" successfully removed.',
                    expires: 'Expires: ',
                    noApplications: 'No Authorized Applications'
                },
                trustedDevices: {
                    title: 'Trusted Devices',
                    subtitle: 'Devices you have signed in with.',
                    removeConfirmation: 'Are you sure you want to remove "{deviceName}" from your list of trusted devices?',
                    removeSuccess: '"{deviceName}" successfully removed.',
                    noDevices: 'No Trusted Devices'
                },
                editProfile: {
                    userDetailsTitle: 'Edit your personal info',
                    optional: '(optional)'
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
            },
            uma: {
                activity: {
                    'Authorisation_Granted': 'You created',
                    'Authorisation_Requested': '{requestingParty} requested access to',
                    'Authorisation_Request_Denied': 'You denied the request from {requestingParty} to access',
                    'Authorisation_Request_Approved': 'You approved the request from {requestingParty} to access',
                    'Policy_Created': 'You shared',
                    'Policy_Updated': 'You updated sharing setting for'
                },
                resources: {
                    noDataState: 'You haven\'t shared anything yet.',
                    search: 'Search...',
                    viewAs: 'View as',
                    list: 'List',
                    grid: 'Grid',
                    cancel: 'Cancel',
                    share: 'Share',
                    unshare: 'Unshare',
                    unshareAll: 'Unshare all',
                    shareWith: 'Share with...',
                    resourceNotShared: 'Resource not shared',
                    sharedWithPeople: 'Shared with {numberOf} people',
                    sharedWithPerson: 'Shared with 1 person',
                    warningMessage: 'Sharing disabled. You\'ll still keep a copy.',
                    unshareResource: 'Unshare "{resourceName}" ?',
                    sameShareError: 'Cannot reshare resource with {requestingParty}.  Unshare with requesting party before changing permissions',
                    noRequestingParty: 'No requesting party defined.'
                },
                requests: {
                    allow: 'Allow',
                    deny: 'Deny',
                    allowed: 'Allowed',
                    denied: 'Denied',
                    requestedAccess: 'requested access to:'
                },
                notifications: {
                    requests: 'Requests'
                }
            },
            workflow: {
                startProcess: 'Start a Process',
                noProcess: 'No processes at this time',
                noAssignedTasks: 'No assigned tasks at this time',
                noGroupTasks: 'Your group has no tasks at this time',
                start: 'Start',
                myTasks: 'My tasks',
                unassignedTasks: 'Unassigned Tasks'
            }
        }
    }
};
