import { getMainWindow } from "@/mainWindow";
import { actions } from "@/scraper_actions";
import { AnyQuestion, CancellablePromise, NamedResponse, QuestionCancelError, QuestionConfirm, QuestionOptions, QuestionOptions2D, QuestionValue } from "@thecointech/scraper-agent";
import { randomUUID } from "crypto";
import type { BrowserWindow } from "electron";

type SenderArgs = Parameters<typeof BrowserWindow.prototype.webContents.send>;
type Sender = (...args: SenderArgs) => void;

const defaultSender: Sender = (...args) => {
  const mainWindow = getMainWindow();
  mainWindow?.webContents.send(...args);
};

function makeCancellable<T>(promise: Promise<T>, cancel: () => void): CancellablePromise<T> {
  const cp = promise as CancellablePromise<T>;
  cp.cancel = cancel;
  return cp;
}

type BaseQuestionType = {
  sessionId: string;
  questionId: string;
}

export type ConfirmPacket = QuestionConfirm & BaseQuestionType;
export type QuestionPacket = QuestionValue & BaseQuestionType;
export type OptionPacket = QuestionOptions & BaseQuestionType;
export type Option2DPacket = QuestionOptions2D & BaseQuestionType;

export type ResponsePacket = {
  // Value is either the response for a question or a SelectOption
  value: string | boolean | NamedResponse;
} & BaseQuestionType;

export type ClearQuestionPacket = {
  questionId?: string;
} & Omit<BaseQuestionType, "questionId">;

export type AnyQuestionPacket = QuestionPacket | ConfirmPacket | OptionPacket | Option2DPacket;

type DeferredPromise<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: any) => void;
}

export class AskUserReact implements Disposable {
  sessionID = randomUUID();
  responses: Record<string, DeferredPromise<any>> = {};
  static __instances: Record<string, AskUserReact> = {};
  private sender: Sender;

  protected constructor(sender: Sender = defaultSender) {
    this.sender = sender;
    AskUserReact.__instances[this.sessionID] = this;
  }

  addDeferredResponse<T = string>(questionId: string) {
    const deferred: Partial<DeferredPromise<T>> = {}
    deferred.promise = new Promise<T>((resolve, reject) => {
      deferred.resolve = resolve;
      deferred.reject = reject;
    })
    this.responses[questionId] = deferred as DeferredPromise<T>;
    return deferred.promise;
  }

  clearQuestion(questionId?: string) {
    const packet: ClearQuestionPacket = {
      sessionId: this.sessionID,
      questionId,
    };
    this.sender(actions.onClearQuestion, packet);

    if (questionId) {
      const response = this.responses[questionId];
      if (response) {
        response.reject(new QuestionCancelError());
        delete this.responses[questionId];
      }
    } else {
      for (const id in this.responses) {
        const response = this.responses[id];
        response.reject(new QuestionCancelError());
        delete this.responses[id];
      }
    }
  }

  static onResponse(packet: ResponsePacket) {
    const askUser = this.getSession(packet.sessionId);
    if (!askUser) {
      throw new Error("Session not found");
    }
    const response = askUser.responses[packet.questionId];
    if (!response) {
      throw new Error(`Response ${packet.questionId} not found`);
    }
    response.resolve(packet.value);
  }

  clearUnresolved() {
    this.clearQuestion();
  }

  sendQuestion<T = string>(packet: AnyQuestion): CancellablePromise<T> {
    const questionId = randomUUID();
    const responsePromise = this.addDeferredResponse<T>(questionId);
    this.sender(actions.onAskQuestion, {
      ...packet,
      sessionId: this.sessionID,
      questionId
    });
    return makeCancellable(responsePromise, () => {
      this.clearQuestion(questionId);
    });
  }

  static newSession(sender?: Sender) {
    const instance = new AskUserReact(sender);
    return instance;
  }
  static getSession(id: string) {
    return this.__instances[id];
  }
  static endSession(id: string) {
    if (!this.__instances[id]) {
      return;
    }
    this.__instances[id].clearUnresolved();
    delete this.__instances[id];
  }

  [Symbol.dispose]() {
    AskUserReact.endSession(this.sessionID);
  }
}
