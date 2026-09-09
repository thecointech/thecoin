import { jest } from '@jest/globals';
import { actions } from '@/scraper_actions';
import { QuestionCancelError } from '@thecointech/scraper-agent';

jest.unstable_mockModule('electron', () => ({
  BrowserWindow: {
    fromId: jest.fn(),
  },
}));
const { AskUserReact } = await import('./askUser');

describe('AskUserReact', () => {

  const sendMock = jest.fn();

  beforeEach(() => {
    sendMock.mockClear();
  });

  afterEach(() => {
    for (const id in AskUserReact.__instances) {
      AskUserReact.endSession(id);
    }
  });

  it('sends a question and resolves on response', async () => {
    const session = AskUserReact.newSession(sendMock);
    const promise = session.sendQuestion({ question: 'What is your name?' });

    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock).toHaveBeenCalledWith(
      actions.onAskQuestion,
      expect.objectContaining({
        question: 'What is your name?',
        sessionId: session.sessionID,
        questionId: expect.any(String),
      })
    );

    const { questionId } = sendMock.mock.calls[0][1] as { questionId: string };
    AskUserReact.onResponse({
      sessionId: session.sessionID,
      questionId,
      value: 'Alice',
    });

    await expect(promise).resolves.toBe('Alice');
  });

  it('clears a question and rejects the pending promise', async () => {
    const session = AskUserReact.newSession(sendMock);
    const promise = session.sendQuestion({ question: 'What is your name?' });
    const { questionId } = sendMock.mock.calls[0][1] as { questionId: string };

    session.clearQuestion(questionId);

    expect(sendMock).toHaveBeenCalledTimes(2);
    expect(sendMock).toHaveBeenLastCalledWith(
      actions.onClearQuestion,
      expect.objectContaining({
        sessionId: session.sessionID,
        questionId,
      })
    );

    await expect(promise).rejects.toBeInstanceOf(QuestionCancelError);
  });

  it('clears all questions when ending the session', async () => {
    const session = AskUserReact.newSession(sendMock);
    const promise1 = session.sendQuestion({ question: 'Question 1' });
    const promise2 = session.sendQuestion({ question: 'Question 2' });

    session[Symbol.dispose]();

    const [result1, result2] = await Promise.allSettled([promise1, promise2]);
    expect(result1.status).toBe('rejected');
    expect((result1 as PromiseRejectedResult).reason).toBeInstanceOf(QuestionCancelError);
    expect(result2.status).toBe('rejected');
    expect((result2 as PromiseRejectedResult).reason).toBeInstanceOf(QuestionCancelError);
    expect(AskUserReact.getSession(session.sessionID)).toBeUndefined();
    expect(sendMock).toHaveBeenLastCalledWith(
      actions.onClearQuestion,
      expect.objectContaining({
        sessionId: session.sessionID,
      })
    );
  });
});
