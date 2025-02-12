import { getMainWindow } from "@/mainWindow";
import { actions } from "@/scraper_actions";
import { ChoiceText, IAskUser, User2DChoice } from "@thecointech/scraper-agent";
import { randomUUID } from "crypto";

export type QuestionPacket = {
  question: string;
  sessionId: string;
  questionId: string;
}
export type ResponsePacket = {
  response: string;
  sessionId: string;
  questionId: string;
}
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
  responses: Record<string, DeferredPromise<string>> = {};
  static __instances: Record<string, AskUserReact> = {};

  private constructor() {
    this.addDeferredResponse(QuestionId.Username);
    this.addDeferredResponse(QuestionId.Password);
    AskUserReact.__instances[this.sessionID] = this;
  }

  addDeferredResponse(questionId: string) {
    const deferred: Partial<DeferredPromise<string>> = {}
    deferred.promise = new Promise<string>((resolve, reject) => {
      deferred.resolve = resolve;
      deferred.reject = reject;
    })
    this.responses[questionId] = deferred as DeferredPromise<string>;
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
    response.resolve(packet.response);
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

  forValue(question: string): Promise<string> {

    const mainWindow = getMainWindow();
    const questionId = randomUUID();
    const responsePromise = this.addDeferredResponse(questionId);
    const packet: QuestionPacket = { question, sessionId: this.sessionID, questionId };
    mainWindow!.webContents.send(actions.onAskQuestion, packet);
    return responsePromise;
  }
  selectOption<T extends object>(question: string, options: User2DChoice<T>, z: ChoiceText<T>): Promise<T> {
    // TODO
    throw new Error("Method not implemented.");
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
}
