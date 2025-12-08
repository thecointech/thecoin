import React from 'react';
import type { StoryContext } from '@storybook/react';

// A simple map to hold all registered callbacks
const callbacks: Set<Function> = new Set();

// The mocked structure of your exposed Electron API
export const scraperMock = {
    // Mimics the ipcRenderer.on structure
    onAskQuestion: (callback: (value: any) => void) => {
        // 1. Register the callback
        callbacks.add(callback);

        // 2. Return an "unsubscriber" function
        return () => callbacks.delete(callback);
    },
    replyQuestion: (question: any) => {
        console.log("replyQuestion", question)
        return { value: true }
    },

    // 3. This is the new, exposed function used to TRIGGER the event
    //    It is not part of the production Electron API, only the mock.
    triggerAskQuestion: (question: any) => {
        callbacks.forEach(cb => cb(question));
    }
};

// Optionally, you can attach this mock to the window object for easy access in Storybook
if (typeof window !== 'undefined') {
    // @ts-ignore - Ignore the TypeScript error because this is a mock
    window.scraper = scraperMock;
}

export const triggerAskQuestion = scraperMock.triggerAskQuestion;

export const withAskQuestion = (StoryFn: React.ElementType, context: StoryContext) => {
  const { question } = context.args;
  setTimeout(() => triggerAskQuestion(question), 100);
  return <StoryFn />;
}
