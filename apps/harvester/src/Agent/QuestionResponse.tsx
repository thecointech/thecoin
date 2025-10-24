import { useEffect, useState } from "react";
import type { AnyQuestionPacket } from "@/Harvester/agent/askUser";
import { Button, Dimmer, Input, Loader, Segment, Select } from "semantic-ui-react";
import { NamedResponse } from "@thecointech/scraper-agent/types";
import { useBackgroundTask } from "@/BackgroundTask";
import type { BackgroundTaskType } from "@/BackgroundTask/types";
import { isRunning } from "@/BackgroundTask/selectors";

export const QuestionResponse: React.FC<{
  backgroundTaskId: BackgroundTaskType;
}> = ({ backgroundTaskId }) => {

  const [question, setQuestion] = useState<AnyQuestionPacket | undefined>()
  const [answer, setAnswer] = useState<string|NamedResponse>('')
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const bgTask = useBackgroundTask(backgroundTaskId);

  const taskRunning = isRunning(bgTask);

  useEffect(() => {
    const release = window.scraper.onAskQuestion((question: AnyQuestionPacket) => {
      setQuestion(question);
      setHasSubmitted(false);
    })
    return release;
  }, []);

  const onReply = async (answer: string|NamedResponse|boolean) => {
    const r = await window.scraper.replyQuestion({
      ...question!,
      value: answer
    });
    if (r.error) alert(r.error);
    if (r.value) {
      // setQuestion(undefined);
    }
    setHasSubmitted(true);
  }
  const onSubmit = () => onReply(answer)
  const onConfirm = () => onReply(true)
  const onCancel = () => onReply(false)

  if (!taskRunning || !question) return null;

  if ("options" in question) {
    return (
      <Segment>
        <Dimmer active={hasSubmitted}>
          <Loader />
        </Dimmer>
        <div>{question.question}</div>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <Select options={question.options.map((o, idx) => ({ key: idx, text: o, value: o }))} value={answer as string} onChange={(_, data) => setAnswer(data.value as string)} />
          <Button color='green' onClick={onSubmit} content='Submit' />
        </div>
      </Segment>
    )
  }
  else if ("options2d" in question) {
    return (
      <Segment>
        <Dimmer active={hasSubmitted}>
          <Loader />
        </Dimmer>
        <div>{question.question}</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {question.options2d.map((row, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <span>{row.name}: </span>
              {
                row.options.map((col, idx) => (
                  <Button
                    color={((answer as any)?.name === row.name && (answer as any)?.option === col) ? 'green' : undefined}
                    key={idx} onClick={() => setAnswer({ name: row.name, option: col })}>{col}</Button>
                ))
              }
            </div>
          ))}
          <Button onClick={onSubmit} content='Submit' />

        </div>
      </Segment>
    )
  }
  else if ("confirm" in question) {
    return (
      <Segment>
        <Dimmer active={hasSubmitted}>
          <Loader />
        </Dimmer>
        <div>{question.confirm}</div>
        <Button color='green' onClick={onConfirm} content='Confirm' />
        <Button onClick={onCancel} content='Cancel' />
      </Segment>
    )
  }
  else {
    return (
      <Segment>
        <Dimmer active={hasSubmitted}>
          <Loader />
        </Dimmer>
        <div>{question.question}</div>
        <Input value={answer} onChange={e => setAnswer(e.target.value)} />
        <Button color='green' onClick={onSubmit} content='Submit' />
      </Segment>
    )
  }
}
