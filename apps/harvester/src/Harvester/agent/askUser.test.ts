import { jest } from '@jest/globals';
import { actions } from '@/scraper_actions';

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
    const promise = session.forValue('What is your name?');

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
    const promise = session.forValue('What is your name?');
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

    await expect(promise).rejects.toBe('Question cleared');
  });

  it('clears all questions when ending the session', async () => {
    const session = AskUserReact.newSession(sendMock);
    const promise1 = session.forValue('Question 1');
    const promise2 = session.forValue('Question 2');

    session[Symbol.dispose]();

    await expect(promise1).rejects.toBe('Question cleared');
    await expect(promise2).rejects.toBe('Question cleared');
    expect(AskUserReact.getSession(session.sessionID)).toBeUndefined();
    expect(sendMock).toHaveBeenLastCalledWith(
      actions.onClearQuestion,
      expect.objectContaining({
        sessionId: session.sessionID,
      })
    );
  });
});
