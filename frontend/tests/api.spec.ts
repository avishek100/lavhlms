import { test, expect } from '@playwright/test';
import {
    signUpFormControls,
    signInFormControls,
    initialSignUpFormData,
    initialSignInFormData,
    courseLandingPageFormControls,
    courseLandingInitialFormData,
    courseCategories,
    courseLevelOptions,
    languageOptions,
} from '../src/config/index';

test.describe('Form Controls and Initial Data Tests', () => {

    // ✅ Test Sign-Up Form Controls
    test('Sign-Up form controls should have correct labels and placeholders', () => {
        signUpFormControls.forEach(control => {
            expect(control).toHaveProperty('label');
            expect(control).toHaveProperty('placeholder');
        });

        expect(signUpFormControls[0].label).toBe('User Name');
        expect(signUpFormControls[1].label).toBe('User Email');
        expect(signUpFormControls[2].label).toBe('Password');
    });

    // ✅ Test Initial Sign-Up Form Data
    test('Initial sign-up form data should be empty', () => {
        expect(initialSignUpFormData.userName).toBe('');
        expect(initialSignUpFormData.userEmail).toBe('');
        expect(initialSignUpFormData.password).toBe('');
    });

    // ✅ Test Sign-In Form Controls
    test('Sign-In form controls should contain userEmail and password fields', () => {
        expect(signInFormControls.length).toBe(2);
        expect(signInFormControls[0].name).toBe('userEmail');
        expect(signInFormControls[1].name).toBe('password');
    });

    // ✅ Test Initial Sign-In Form Data
    test('Initial sign-in form data should be empty', () => {
        expect(initialSignInFormData.userEmail).toBe('');
        expect(initialSignInFormData.password).toBe('');
    });

    // ✅ Test Course Landing Page Form Controls
    test('Course landing page form should contain all necessary fields', () => {
        const expectedFields = [
            'title', 'category', 'level', 'primaryLanguage',
            'subtitle', 'description', 'pricing', 'objectives', 'welcomeMessage'
        ];

        const actualFields = courseLandingPageFormControls.map(control => control.name);
        expect(actualFields).toEqual(expectedFields);
    });

    // ✅ Test Initial Course Landing Form Data
    test('Initial course landing form data should be empty', () => {
        Object.values(courseLandingInitialFormData).forEach(value => {
            expect(value).toBe('');
        });
    });

    // ✅ Test Course Category Options
    test('Course categories should have valid labels and ids', () => {
        courseCategories.forEach(category => {
            expect(category).toHaveProperty('id');
            expect(category).toHaveProperty('label');
        });

        expect(courseCategories[0].id).toBe('web-development');
    });

    // ✅ Test Course Level Options
    test('Course level options should contain beginner, intermediate, and advanced', () => {
        const levels = courseLevelOptions.map(level => level.id);
        expect(levels).toContain('beginner');
        expect(levels).toContain('intermediate');
        expect(levels).toContain('advanced');
    });

    // ✅ Test Language Options
    test('Language options should include English and Spanish', () => {
        const languages = languageOptions.map(lang => lang.id);
        expect(languages).toContain('english');
        expect(languages).toContain('spanish');
    });

});
