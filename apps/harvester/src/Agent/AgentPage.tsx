// import React, { useState } from 'react';
// import { Button, Accordion, Icon, StrictAccordionTitleProps, Loader } from 'semantic-ui-react';
// import { type GroupAndSubTask, isRunning, useBackgroundTask } from '@/BackgroundTask';
// import { BankData} from './BankCard/data';
// import { QuestionResponse } from './QuestionResponse';
// import { LoginDetails } from './LoginDetails';
// import { SelectBank } from './SelectBank';
// import { ActionType } from '@/Harvester/scraper';
// import { BackgroundTaskErrors, BackgroundTaskProgressBar } from '@/BackgroundTask/BackgroundTaskProgressBar';
// import { Link } from 'react-router-dom';

// export const AgentPage: React.FC = () => {
//   const [chequingBank, setChequingBank] = useState<BankData>();
//   const [creditBank, setCreditBank] = useState<BankData>();
//   const [activeIndex, setActiveIndex] = useState(0);

//   const recordTask = useBackgroundTask('record');
//   const isRecording = isRunning(recordTask);

//   const differentBanks = chequingBank && creditBank && chequingBank.url !== creditBank.url;
//   const qaIndex = differentBanks ? 4 : 3;

//   const handleSetChequingBank = (bank: BankData) => {
//     setChequingBank(bank);
//     if (bank.url) {
//       setActiveIndex(i => i + 1);
//     }
//   };

//   const handleSetCreditBank = (bank: BankData) => {
//     setCreditBank(bank);
//     if(bank.url) {
//       setActiveIndex(i => i + 1);
//     }
//   };

//   const setQuestionActive = () => {
//     setActiveIndex(qaIndex);
//   }

//   const handleAccordionClick = (_e: React.MouseEvent, titleProps: StrictAccordionTitleProps) => {
//     if (isRecording) {
//       return;
//     }
//     const index = Number(titleProps.index ?? 0);
//     const newIndex = activeIndex === index ? -1 : index;
//     setActiveIndex(newIndex);
//   };

//   return (
//     <div className="agent-page" style={{ padding: '2rem' }}>
//       <div style={{ marginBottom: '2rem' }}>

//         <Accordion fluid styled>
//           <Accordion.Title
//             active={activeIndex === 0}
//             index={0}
//             onClick={handleAccordionClick}
//           >
//             <Icon name="dropdown" />
//             {getTitle(chequingBank, 'Chequing')}
//           </Accordion.Title>
//           <Accordion.Content active={activeIndex === 0}>
//             <SelectBank onSelectBank={handleSetChequingBank} type="chequing" />
//           </Accordion.Content>

//           <Accordion.Title
//             active={activeIndex === 1}
//             index={1}
//             onClick={handleAccordionClick}
//           >
//             <Icon name="dropdown" />
//             {getTitle(creditBank, 'Credit')}
//           </Accordion.Title>
//           <Accordion.Content active={activeIndex === 1}>
//             <SelectBank onSelectBank={handleSetCreditBank} type="credit" />
//           </Accordion.Content>

//           <Accordion.Title
//             disabled={chequingBank === undefined || creditBank === undefined}
//             active={activeIndex === 2}
//             index={2}
//             onClick={handleAccordionClick}
//           >
//           <Icon name="dropdown" />
//             Login Details: {chequingBank?.name}
//           </Accordion.Title>
//           <Accordion.Content active={activeIndex === 2}>
//             <LoginDetails {...chequingBank!} type={differentBanks ? "chequing" : "both"} />
//           </Accordion.Content>
//           {
//             (differentBanks) && (
//               <>
//                 <Accordion.Title
//                   disabled={creditBank === undefined}
//                   active={activeIndex === 3}
//                   index={3}
//                   onClick={handleAccordionClick}
//                 >
//                 <Icon name="dropdown" />
//                   Login Details: {creditBank?.name}
//                 </Accordion.Title>
//                 <Accordion.Content active={activeIndex === 3}>
//                   <LoginDetails {...creditBank!} type="credit" />
//                 </Accordion.Content>
//               </>
//             )
//           }
//           <Accordion.Title
//             active={activeIndex === qaIndex}
//             index={qaIndex}
//             onClick={handleAccordionClick}
//           >
//           <Icon name="dropdown" />
//             Additional Info
//           </Accordion.Title>
//           <Accordion.Content active={activeIndex === qaIndex}>
//             <QuestionResponse setQuestionActive={setQuestionActive} enabled={isRecording} />
//           </Accordion.Content>
//         </Accordion>
//       </div>

//       <BackgroundTaskProgressBar type="record" />
//       <BackgroundTaskErrors type='record' />
//       <div>
//         <Link to="/config">Finalize Harvester Settings</Link>
//       </div>
//       {/* <ValidateTask record={recordTask} type="chqBalance" />
//       <ValidateTask record={recordTask} type="chqETransfer" />
//       <ValidateTask record={recordTask} type="visaBalance" />
//       <BackgroundTaskProgressBar type="replay" />*/}
//     </div>
//   );
// };

// type ValidateTaskProps = {
//   record?: GroupAndSubTask
//   type: ActionType
// }
// export const ValidateTask = ({record, type}: ValidateTaskProps) => {

//   async function validate(): Promise<void> {
//     const r = await window.scraper.validateAction(type, {});
//     if (r.error) alert(r.error);
//     console.log('Validation result:', r.value);
//   }

//   const replay = useBackgroundTask("replay");
//   // Don't do anything while recording/replaying
//   if (isRunning(record) || isRunning(replay)) {
//     return <Loader active />
//   }

//   // Get our specific section
//   const ourTask = replay?.subTasks.find(t => t.subTaskId === type);
//   // If we have recorded, but our task hasn't run, show a button to validate
//   if (record && !ourTask) {
//     return (
//       <div>
//         Agent completed <Button onClick={validate}>Validate {type}</Button>
//       </div>
//     )
//   }
//   // If we have/are replayed, show the progress bar
//   return (
//     <>
//     <BackgroundTaskProgressBar type='replay' subTask={type} />
//     <BackgroundTaskErrors type='replay' subTask={type} />
//     </>
//   )
//     // if (ourTask?.error) {
//     //   return (
//     //     <div style={{ color: 'red' }}>{ourTask.error}</div>
//     //   )
//     // }
//   // else if (ourTask?.running) {
//   //   return <Loader active />
//   // }
//   // // else if (task?.completed) {
//   //   return (
//   //     <>

//   //     <div color="darkgreen">
//   //       {result && Object.entries(result).map(([k, v]) => <div key={k}>{k}: {v}</div>)}
//   //     </div>
//   //     </>
//   //   )
//   // }
//   // return null;
// }

// const getTitle = (bank: BankData | undefined, type: 'Chequing' | 'Credit') =>
//   bank?.name
//     ? `${type}: ${bank.name}`
//     : `Select ${type} Bank`;

// export default AgentPage;
