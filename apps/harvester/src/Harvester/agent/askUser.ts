import { getMainWindow } from "@/mainWindow";
import { actions } from "@/scraper_actions";
import { NamedOptions, NamedResponse } from "@thecointech/scraper-agent";
import { randomUUID } from "crypto";

type BaseQuestionType = {
  sessionId: string;
  questionId: string;
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

  protected constructor() {
    // this.depositAddress = depositAddress ?? "--unused--";
    // this.addDeferredResponse(QuestionId.Username);
    // this.addDeferredResponse(QuestionId.Password);
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
    for (const questionId in this.responses) {
      const response = this.responses[questionId];
      let isResolved = false;
      response.promise.then(() => isResolved = true);
      if (!isResolved) {
        response.reject("Session expired");
      }
    }
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

  sendQuestion<T = string>(packet: Omit<AnyQuestionPacket, "sessionId" | "questionId">): Promise<T> {
    const mainWindow = getMainWindow();
    const questionId = randomUUID();
    const responsePromise = this.addDeferredResponse<T>(questionId);
    mainWindow!.webContents.send(actions.onAskQuestion, {
      ...packet,
      sessionId: this.sessionID,
      questionId
    });
    return responsePromise;
  }

  static newSession() {
    const instance = new AskUserReact();
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
