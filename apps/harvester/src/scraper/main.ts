import { Recorder } from './record';
import { initConfig } from '../Harvester/config';
import { replay, replayEvents } from './replay';
import { AnyEvent } from './types';

console.log("Testing stuff");

await initConfig();
process.env.RUN_SCRAPER_HEADLESS = "false";
(async () => {
    let events: AnyEvent[] = [{"type":"navigation","to":"https://en.wikipedia.org/wiki/Main_Page","timestamp":1699809858159},{"type":"click","timestamp":1699809865394,"clickX":434,"clickY":27,"tagName":"INPUT","selector":"DIV > DIV:nth-child(1) > INPUT:nth-child(1)","coords":{"top":17,"left":336,"height":32,"width":406.296875},"text":"","font":{"font":"14px / 20px sans-serif","color":"rgb(32, 33, 34)","size":"14px","style":"normal"},"siblingText":["Main menu","Search","Create account","Log in","Personal tools"]},{"type":"click","timestamp":1699809873038,"clickX":395,"clickY":36,"tagName":"INPUT","selector":"DIV > DIV:nth-child(1) > INPUT:nth-child(1)","coords":{"top":17,"left":336,"height":32,"width":406.296875},"text":"","font":{"font":"14px / 20px sans-serif","color":"rgb(32, 33, 34)","size":"14px","style":"normal"},"siblingText":["Main menu","Search","Create account","Log in","Personal tools"]},{"type":"input","timestamp":1699809877568,"value":"chicken","frame":"https://en.wikipedia.org/wiki/Main_Page","tagName":"INPUT","selector":"DIV > DIV:nth-child(1) > INPUT:nth-child(1)","coords":{"top":17,"left":312,"height":32,"width":430.296875},"text":"","font":{"font":"14px / 20px sans-serif","color":"rgb(32, 33, 34)","size":"14px","style":"normal"},"siblingText":["Main menu","Search","Create account","Log in","Personal tools"]},{"type":"click","timestamp":1699809882085,"clickX":412,"clickY":73,"tagName":"SPAN","selector":"LI#cdx-menu-item-56 > A:nth-child(1) > SPAN:nth-child(2) > SPAN:nth-child(1) > BDI:nth-child(1) > SPAN:nth-child(1)","coords":{"top":60,"left":373,"height":16,"width":50.59375},"text":"Chicken","font":{"font":"14px / 20px sans-serif","color":"rgb(32, 33, 34)","size":"14px","style":"normal"},"siblingText":["Chicken"]},{"type":"navigation","to":"https://en.wikipedia.org/wiki/Chicken","timestamp":1699809882359},{"type":"click","timestamp":1699809895307,"clickX":381,"clickY":908,"tagName":"A","selector":"UL:nth-child(20) > LI:nth-child(3) > I:nth-child(1) > A:nth-child(1)","coords":{"top":901.84375,"left":358.390625,"height":16,"width":35.015625},"text":"Chick","font":{"font":"italic 14px / 22.4px sans-serif","color":"rgb(51, 102, 204)","size":"14px","style":"italic"},"siblingText":["Chick",": a young chicken"]},{"type":"navigation","to":"https://en.wikipedia.org/wiki/Chick_(young_bird)","timestamp":1699809895426},{"type":"click","timestamp":1699809900173,"clickX":468,"clickY":19238,"tagName":"A","selector":"DIV:nth-child(213) > A:nth-child(1)","coords":{"top":19229.28125,"left":437.75,"height":16,"width":91.0625},"text":"Brood parasite","font":{"font":"italic 14px / 22.4px sans-serif","color":"rgb(51, 102, 204)","size":"14px","style":"italic"},"siblingText":["Main article: ","Brood parasite"]},{"type":"navigation","to":"https://en.wikipedia.org/wiki/Brood_parasite","timestamp":1699809900328},{"type":"value","timestamp":1699809921778,"clickX":408,"clickY":161,"tagName":"SPAN","selector":"LI#ca-talk > A:nth-child(1) > SPAN:nth-child(1)","coords":{"top":149.640625,"left":390.90625,"height":16,"width":24.90625},"text":"Talk","font":{"font":"14px sans-serif","color":"rgb(51, 102, 204)","size":"14px","style":"normal"},"siblingText":["Article","Talk","Read","View source","View history","Tools"],"name":"defaultValue","parsing":{"type":"text","format":null}},{"type":"click","timestamp":1699809927932,"clickX":1197,"clickY":34,"tagName":"INPUT","selector":"INPUT#vector-user-links-dropdown-checkbox","coords":{"top":17,"left":1185,"height":32,"width":32},"text":"","font":{"font":"13.3333px Arial","color":"rgb(0, 0, 0)","size":"13.3333px","style":"normal"},"siblingText":["Main menu","Search","Create account","Log in","Personal tools"]},{"type":"input","timestamp":1699809927944,"valueChanged":true,"value":"on","frame":"https://en.wikipedia.org/wiki/Brood_parasitism","tagName":"INPUT","selector":"INPUT#vector-user-links-dropdown-checkbox","coords":{"top":17,"left":1185,"height":32,"width":32},"text":"","font":{"font":"13.3333px Arial","color":"rgb(0, 0, 0)","size":"13.3333px","style":"normal"},"siblingText":["Main menu","Search","Create account","Log in","Personal tools"]},{"type":"click","timestamp":1699809930482,"clickX":1037,"clickY":137,"tagName":"SPAN","selector":"LI#pt-anontalk > A:nth-child(1) > SPAN:nth-child(1)","coords":{"top":132,"left":1030,"height":16,"width":24.90625},"text":"Talk","font":{"font":"14px sans-serif","color":"rgb(51, 102, 204)","size":"14px","style":"normal"},"siblingText":["Talk"]},{"type":"navigation","to":"https://en.wikipedia.org/wiki/Special:MyTalk","timestamp":1699809930665}]

    // const recorder =  await Recorder.instance("chqBalance", "https://en.wikipedia.org/wiki/Main_Page",
    // {
    //     SearchFor: "Chicken",
    // });
    // await new Promise(resolve => setTimeout(resolve, 60 * 1000));
    // const r = await recorder.setRequiredValue();
    // console.log("We got " + r.text)
    // await recorder.disconnected;
    // events = recorder.events;

    await replayEvents("chqBalance", events, {
        SearchFor: "Chicken",
    })
})();


