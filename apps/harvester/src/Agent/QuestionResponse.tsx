import { useEffect, useRef, useState } from "react";
import type { QuestionPacket } from "@/Harvester/agent/askUser";
import { Button, Dimmer, Input, Loader, Segment, Select } from "semantic-ui-react";

export const QuestionResponse: React.FC<{
  setQuestionActive: () => void;
  isTaskRunning: boolean;
}> = ({ setQuestionActive, isTaskRunning }) => {

  const [question, setQuestion] = useState<QuestionPacket | undefined>()
  const [answer, setAnswer] = useState('')
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const setQuestionActiveRef = useRef(setQuestionActive);

  useEffect(() => {
    setQuestionActiveRef.current = setQuestionActive;
  }, [setQuestionActive]);

  useEffect(() => {
    window.scraper.onAskQuestion((question: QuestionPacket) => {
      setQuestion(question);
      setQuestionActiveRef.current();
      setHasSubmitted(false);
    })
  }, []);

  useEffect(() => {
    if (!isTaskRunning) {
      setQuestion(undefined);
    }
  }, [isTaskRunning])

  const onSubmit = async () => {
    const r = await window.scraper.replyQuestion({
      ...question!,
      response: answer
    });
    if (r.error) alert(r.error);
    if (r.value) {
      // setQuestion(undefined);
    }
    setHasSubmitted(true);
  }

  if (!question) return null;
  return !question.options ? (
    <Segment>
      <Dimmer active={hasSubmitted}>
        <Loader />
      </Dimmer>
      <div>{question.question}</div>
      <Input value={answer} onChange={e => setAnswer(e.target.value)} />
      <Button color='green' onClick={onSubmit} content='Submit' />
  </Segment>
  ) : (
    <Segment>
      <Dimmer active={hasSubmitted}>
        <Loader />
      </Dimmer>
      <div>{question.question}</div>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <Select options={question.options.map((o,idx) => ({ key: idx, text: o, value: o }))} value={answer} onChange={(_, data) => setAnswer(data.value as string)} />
        <Button color='green' onClick={onSubmit} content='Submit' />
      </div>
  </Segment>
  )
}
