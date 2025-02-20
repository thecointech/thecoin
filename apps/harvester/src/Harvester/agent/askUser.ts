import { getMainWindow } from "@/mainWindow";
import { actions } from "@/scraper_actions";
import { IAskUser, NamedOptions, NamedResponse } from "@thecointech/scraper-agent";
import { randomUUID } from "crypto";

type BaseQuestionType = {
  sessionId: string;
  questionId: string;
}
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
  value: string | {
    name: string;
    option: string
  }
}) & BaseQuestionType;

export type AnyQuestionPacket = QuestionPacket | OptionPacket | Option2DPacket;

type DeferredPromise<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: any) => void;
}

enum QuestionId {
  Username = 'username',
  Password = 'password',
  Recipient = 'recipient'
}
export class AskUserReact implements IAskUser {
  sessionID = randomUUID();
  depositAddress: string;
  responses: Record<string, DeferredPromise<any>> = {};
  static __instances: Record<string, AskUserReact> = {};

  private constructor(depositAddress: string) {
    this.depositAddress = depositAddress;
    this.addDeferredResponse(QuestionId.Username);
    this.addDeferredResponse(QuestionId.Password);
    AskUserReact.__instances[this.sessionID] = this;
  }

  // To prevent sending a gazillion ETransfers during dev/testing
  doNotCompleteETransfer(): boolean {
    // Do not complete in any development build
    if (process.env.DO_NOT_SEND_ETRANSFER) {
      return true;
    }
    // Do not complete in any non-prod build
    return (
      process.env.CONFIG_NAME !== 'prod' &&
      process.env.CONFIG_NAME !== 'prodbeta'
    );
  }

  expectedETransferRecipient(): Promise<string> {
    return Promise.resolve(this.depositAddress);
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

  setUsername(username: string) {
    this.responses[QuestionId.Username].resolve(username);
  }
  setPassword(password: string) {
    this.responses[QuestionId.Password].resolve(password);
  }

  forValue(question: string, options?: string[]): Promise<string> {

    const mainWindow = getMainWindow();
    const questionId = randomUUID();
    const responsePromise = this.addDeferredResponse(questionId);
    const packet: QuestionPacket = { question, sessionId: this.sessionID, questionId };
    if (options) {
      (packet as OptionPacket).options = options;
    }
    mainWindow!.webContents.send(actions.onAskQuestion, packet);
    return responsePromise;
  }

  selectOption(question: string, options2d: NamedOptions[]): Promise<NamedResponse> {
    const mainWindow = getMainWindow();
    const questionId = randomUUID();
    const responsePromise = this.addDeferredResponse<NamedResponse>(questionId);
    const packet: Option2DPacket = { question, options2d, sessionId: this.sessionID, questionId };
    mainWindow!.webContents.send(actions.onAskQuestion, packet);
    return responsePromise;
  }
  forUsername(): Promise<string> {
    return this.responses[QuestionId.Username].promise;
  }
  forPassword(): Promise<string> {
    return this.responses[QuestionId.Password].promise;
  }
  forETransferRecipient(): Promise<string> {
    // TODO
    return this.responses['recipient'].promise;
  }

  static newSession(depositAddress: string) {
    const instance = new AskUserReact(depositAddress);
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
}
