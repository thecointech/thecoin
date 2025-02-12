import { useEffect, useState } from "react";
import type { QuestionPacket } from "@/Harvester/agent/askUser";
import { Button, Dimmer, Input, Loader, Segment, Select } from "semantic-ui-react";

export const QuestionResponse: React.FC<{
  setQuestionActive: () => void;
}> = ({ setQuestionActive }) => {

  const [question, setQuestion] = useState<QuestionPacket | undefined>()
  const [answer, setAnswer] = useState('')
  const [hasSubmitted, setHasSubmitted] = useState(false)
  useEffect(() => {
    window.scraper.onAskQuestion((question: QuestionPacket) => {
      setQuestion(question);
      setQuestionActive();
      setHasSubmitted(false);
    })
  }, []);

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
