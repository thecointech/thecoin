import React from 'react';
import type { StoryContext } from '@storybook/react';

// A simple map to hold all registered callbacks
const askQuestionCallbacks: Set<Function> = new Set();
const clearQuestionCallbacks: Set<Function> = new Set();

const mockSessionId = 'storybook-session';

// The mocked structure of your exposed Electron API
export const scraperMock = {
    // Mimics the ipcRenderer.on structure
    onAskQuestion: (callback: (value: any) => void) => {
        // 1. Register the callback
        askQuestionCallbacks.add(callback);

        // 2. Return an "unsubscriber" function
        return () => askQuestionCallbacks.delete(callback);
    },
    onClearQuestion: (callback: (value: any) => void) => {
        clearQuestionCallbacks.add(callback);
        return () => clearQuestionCallbacks.delete(callback);
    },
    replyQuestion: (question: any) => {
        console.log("replyQuestion", question)
        return Promise.resolve({ value: true });
    },

    // 3. This is the new, exposed function used to TRIGGER the event
    //    It is not part of the production Electron API, only the mock.
    triggerAskQuestion: (question: any) => {
        askQuestionCallbacks.forEach(cb => cb({
            sessionId: mockSessionId,
            ...question,
        }));
    },
    triggerClearQuestion: (packet: any) => {
        clearQuestionCallbacks.forEach(cb => cb({
            sessionId: mockSessionId,
            ...packet,
        }));
    }
};

// Optionally, you can attach this mock to the window object for easy access in Storybook
if (typeof window !== 'undefined') {
    // @ts-ignore - Ignore the TypeScript error because this is a mock
    window.scraper = scraperMock;
}

export const triggerAskQuestion = scraperMock.triggerAskQuestion;
export const triggerClearQuestion = scraperMock.triggerClearQuestion;

export const withAskQuestion = (StoryFn: React.ElementType, context: StoryContext) => {
  const { question } = context.args;
  setTimeout(() => triggerAskQuestion(question), 100);
  return <StoryFn />;
}
