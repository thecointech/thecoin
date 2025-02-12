import { useEffect, useState } from "react";
import type { QuestionPacket } from "@/Harvester/agent/askUser";
import { Button, Dimmer, Input, Loader, Segment } from "semantic-ui-react";

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
      // setQuestionActive(false);
    }
    setHasSubmitted(true);
  }

  if (!question) return null;
  return (
    <Segment>
      <Dimmer active={hasSubmitted}>
        <Loader />
      </Dimmer>
      <div>{question.question}</div>
      <Input value={answer} onChange={e => setAnswer(e.target.value)}
      action={
        <Button icon='check' color='green' onClick={onSubmit} />
      }
      />
  </Segment>
  )
}
