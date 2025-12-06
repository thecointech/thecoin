import React from "react";
import { useEffect, useState } from "react";
import type { AnyQuestionPacket, ConfirmPacket, Option2DPacket, OptionPacket, QuestionPacket } from "@/Harvester/agent/askUser";
import { Button, Input, Select } from "semantic-ui-react";
import { NamedResponse } from "@thecointech/scraper-agent/types";
import { Modal } from "semantic-ui-react";
import styles from "./index.module.less";


type QuestionResponseProps = {
  mountNode?: any;
}

export const QuestionResponse = ({ mountNode }: QuestionResponseProps) => {

  const [questions, setQuestions] = useState<AnyQuestionPacket[]>([])
  const [answer, setAnswer] = useState<string|NamedResponse>('')

  useEffect(() => {
    const release = window.scraper.onAskQuestion((question: AnyQuestionPacket) => {
      setQuestions(questions => [...questions, question]);
      setAnswer('');
    })
    return release;
  }, []);

  if (questions.length == 0) return null;
  const question = questions[0];

  const onReply = async (answer: string|NamedResponse|boolean) => {
    const r = await window.scraper.replyQuestion({
      ...question,
      value: answer
    });
    if (r.error) alert(r.error);
    if (r.value) {
      setQuestions(questions => questions.filter(q => q.questionId != question.questionId));
    }
  }

  return (
    <Modal open closeOnDimmerClick={false} mountNode={mountNode}>
      <Modal.Content>
        <div className={styles.qaContainer}>
          <QuestionContent question={question} answer={answer} setAnswer={setAnswer} onReply={onReply} />
        </div>
      </Modal.Content>
    </Modal>
  )
}

type QuestionContentProps = {
  question: AnyQuestionPacket;
  answer: string|NamedResponse;
  setAnswer: (answer: string|NamedResponse) => void;
  onReply: (answer: string|NamedResponse|boolean) => void;
}
const QuestionContent = ({ question, answer, setAnswer, onReply }: QuestionContentProps) => {
  if ("options" in question) {
    return <QuestionOptions question={question} answer={answer as string} setAnswer={setAnswer} onReply={onReply} />
  }
  else if ("options2d" in question) {
    return <QuestionOptions2D question={question} answer={answer as NamedResponse} setAnswer={setAnswer} onReply={onReply} />
  }
  else if ("confirm" in question) {
    return <QuestionConfirm question={question} onReply={onReply} />
  }
  else {
    return <QuestionInput question={question} answer={answer as string} setAnswer={setAnswer} onReply={onReply} />
  }
}

type QuestionBaseProps = {
  onReply: (answer: string|NamedResponse|boolean) => void;
}
type QuestionAnswerableProps = QuestionBaseProps & {
  setAnswer: (answer: string|NamedResponse) => void;
}
type QuestionOptionsProps = QuestionAnswerableProps & {
  question: OptionPacket;
  answer: string;
}
const QuestionOptions = ({ question, answer, onReply, setAnswer }: QuestionOptionsProps) => (
  <>
    <div>{question.question}</div>
    <div className={styles.options}>
      <Select
        className={styles.select}
        options={question.options.map((o, idx) => ({ key: idx, text: o, value: o }))}
        value={answer as string}
        onChange={(_, data) => setAnswer(data.value as string)} />
      <SubmitButton answer={answer} onReply={onReply} />
    </div>
  </>
)

type QuestionOptions2DProps = QuestionAnswerableProps & {
  question: Option2DPacket;
  answer: NamedResponse;
}
const QuestionOptions2D = ({ question, answer, setAnswer, onReply }: QuestionOptions2DProps) => (
  <div className={styles.options2d}>
    <div>{question.question}</div>
    <div className={styles.table}>
      {question.options2d.map((row, idx) => (
        <div key={idx} className={styles.row}>
          <span className={styles.cell}>{row.name}: </span>
          {
            row.options.map((col, idx) => (
              <span key={idx} className={styles.cell}>
                <Button
                  size="small" compact toggle
                  active={((answer as any)?.name === row.name && (answer as any)?.option === col)}
                  onClick={() => setAnswer({ name: row.name, option: col })}>{col}</Button>
              </span>
            ))
          }
        </div>
      ))}
    </div>
    <SubmitRow answer={answer} onReply={onReply} />
  </div>
)

type QuestionConfirmProps = QuestionBaseProps & {
  question: ConfirmPacket;
}
const QuestionConfirm = ({ question, onReply }: QuestionConfirmProps) => {
  const onConfirm = () => onReply(true)
  const onCancel = () => onReply(false)
  return (
    <div className={styles.confirm}>
      <div>{question.confirm}</div>
      <div className={styles.buttons}>
        <Button onClick={onCancel} content='Cancel' />
        <Button primary onClick={onConfirm} content='Confirm' />
      </div>
    </div>
  )
}

type QuestionInputProps = QuestionAnswerableProps & {
  question: QuestionPacket;
  answer: string;
}
const QuestionInput = ({ question, answer, setAnswer, onReply }: QuestionInputProps) => (
  <>
    <div>{question.question}</div>
    <Input value={answer} onChange={e => setAnswer(e.target.value)} />
    <SubmitRow answer={answer} onReply={onReply} />
  </>
)


const SubmitRow = ({ answer, onReply }: { answer: string|NamedResponse, onReply: (answer: string|NamedResponse|boolean) => void }) =>
  <div className={styles.submitRow}>
    <SubmitButton answer={answer} onReply={onReply} />
  </div>

const SubmitButton = ({ answer, onReply }: { answer: string|NamedResponse, onReply: (answer: string|NamedResponse|boolean) => void }) => (
  <Button primary disabled={!answer} onClick={() => onReply(answer)} content='Submit' />
)
