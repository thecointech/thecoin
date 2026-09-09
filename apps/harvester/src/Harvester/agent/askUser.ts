import { getMainWindow } from "@/mainWindow";
import { actions } from "@/scraper_actions";
import { NamedOptions, NamedResponse } from "@thecointech/scraper-agent";
import { randomUUID } from "crypto";
import type { BrowserWindow } from "electron";

type SenderArgs = Parameters<typeof BrowserWindow.prototype.webContents.send>;

type Sender = (...args: SenderArgs) => void;

const defaultSender: Sender = (...args) => {
  const mainWindow = getMainWindow();
  mainWindow?.webContents.send(...args);
};

type BaseQuestionType = {
  sessionId: string;
  questionId: string;
  header?: string;
}

export type ConfirmPacket = {
  confirm: string;
} & BaseQuestionType;

export type QuestionPacket = {
  question: string;
} & BaseQuestionType;

export type OptionPacket = {
  options: string[];
} & QuestionPacket

export type Option2DPacket = {
  question: string;
  options2d: NamedOptions[];
} & BaseQuestionType;
export type ResponsePacket = ({
  // Value is either the response for a question or a SelectOption
  value: string | boolean | {
    name: string;
    option: string
  }
}) & BaseQuestionType;

export type ClearQuestionPacket = {
  questionId?: string;
} & Omit<BaseQuestionType, "questionId">;

export type AnyQuestionPacket = QuestionPacket | ConfirmPacket | OptionPacket | Option2DPacket;

type DeferredPromise<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: any) => void;
}

type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

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
        response.reject("Question cleared");
        delete this.responses[questionId];
      }
    } else {
      for (const id in this.responses) {
        const response = this.responses[id];
        response.reject("Question cleared");
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


  forValue(question: string, options?: string[]): Promise<string> {
    const packet = { question };
    if (options) {
      (packet as OptionPacket).options = options;
    }
    return this.sendQuestion(packet)
  }

  selectOption(question: string, options2d: NamedOptions[]): Promise<NamedResponse> {
    return this.sendQuestion<NamedResponse>({ question, options2d });
  }

  forConfirm(confirm: string): Promise<boolean> {
    return this.sendQuestion<boolean>({confirm});
  }

  sendQuestion<T = string>(packet: DistributiveOmit<AnyQuestionPacket, "sessionId" | "questionId">): Promise<T> {
    const questionId = randomUUID();
    const responsePromise = this.addDeferredResponse<T>(questionId);
    this.sender(actions.onAskQuestion, {
      ...packet,
      sessionId: this.sessionID,
      questionId
    });
    return responsePromise;
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
