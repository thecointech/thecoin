import { useEffect, useRef, useState } from "react";
import type { AnyQuestionPacket } from "@/Harvester/agent/askUser";
import { Button, Dimmer, Input, Loader, Segment, Select } from "semantic-ui-react";
import { NamedResponse } from "@thecointech/scraper-agent/types";

export const QuestionResponse: React.FC<{
  setQuestionActive: () => void;
  isTaskRunning: boolean;
}> = ({ setQuestionActive, isTaskRunning }) => {

  const [question, setQuestion] = useState<AnyQuestionPacket | undefined>()
  const [answer, setAnswer] = useState<string|NamedResponse>('')
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const setQuestionActiveRef = useRef(setQuestionActive);

  useEffect(() => {
    setQuestionActiveRef.current = setQuestionActive;
  }, [setQuestionActive]);

  useEffect(() => {
    window.scraper.onAskQuestion((question: AnyQuestionPacket) => {
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
      value: answer
    });
    if (r.error) alert(r.error);
    if (r.value) {
      // setQuestion(undefined);
    }
    setHasSubmitted(true);
  }

  if (!question) return null;
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
  // return question.options ? (
  //   <Segment>
  //     <Dimmer active={hasSubmitted}>
  //       <Loader />
  //     </Dimmer>
  //     <div>{question.question}</div>
  //     <Input value={answer} onChange={e => setAnswer(e.target.value)} />
  //     <Button color='green' onClick={onSubmit} content='Submit' />
  // </Segment>
  // ) : (
  //   <Segment>
  //     <Dimmer active={hasSubmitted}>
  //       <Loader />
  //     </Dimmer>
  //     <div>{question.question}</div>
  //     <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
  //       <Select options={question.options.map((o,idx) => ({ key: idx, text: o, value: o }))} value={answer} onChange={(_, data) => setAnswer(data.value as string)} />
  //       <Button color='green' onClick={onSubmit} content='Submit' />
  //     </div>
  //   </Segment>
  // )
}
