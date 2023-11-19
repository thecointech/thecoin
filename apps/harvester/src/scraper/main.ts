import { initConfig } from '../Harvester/config';
import { replayEvents } from './replay';
import { AnyEvent } from './types';

console.log("Testing stuff");

await initConfig();
process.env.RUN_SCRAPER_HEADLESS = "false";
(async () => {
    let events = [{"type":"navigation","to":"https://en.wikipedia.org/wiki/Main_Page","timestamp":1700422729656},{"type":"input","timestamp":1700422734680,"value":"Chicken","frame":"https://en.wikipedia.org/wiki/Main_Page","tagName":"INPUT","role":"combobox","selector":"DIV > DIV:nth-child(1) > INPUT:nth-child(1)","coords":{"top":17,"left":312,"height":32,"width":430.296875},"font":{"font":"14px / 20px sans-serif","color":"rgb(32, 33, 34)","size":"14px","style":"normal"},"label":"Search Wikipedia","text":"","nodeValue":"","siblingText":["Main menu","Search","Create account","Log in","Personal tools"]},{"type":"click","timestamp":1700422736447,"clickX":432,"clickY":88,"tagName":"BDI","role":null,"selector":"LI#cdx-menu-item-56 > A:nth-child(1) > SPAN:nth-child(2) > SPAN:nth-child(2) > BDI:nth-child(1)","coords":{"top":80,"left":373,"height":16,"width":179.765625},"font":{"font":"14px / 20px sans-serif","color":"rgb(84, 89, 93)","size":"14px","style":"normal"},"label":null,"text":"Domesticated species of bird","nodeValue":"Domesticated species of bird","siblingText":[]},{"type":"navigation","to":"https://en.wikipedia.org/wiki/Chicken","timestamp":1700422736700},{"type":"click","timestamp":1700422739698,"clickX":385,"clickY":910,"tagName":"A","role":null,"selector":"LI:nth-child(3) > I:nth-child(1) > A:nth-child(1)","coords":{"top":901.84375,"left":358.390625,"height":16,"width":35.015625},"font":{"font":"italic 14px / 22.4px sans-serif","color":"rgb(51, 102, 204)","size":"14px","style":"italic"},"label":null,"text":"Chick","nodeValue":"Chick","siblingText":[": a young chicken"]},{"type":"navigation","to":"https://en.wikipedia.org/wiki/Chick_(young_bird)","timestamp":1700422739794},{"type":"click","timestamp":1700422742984,"clickX":469,"clickY":19238,"tagName":"A","role":null,"selector":"DIV:nth-child(213) > A:nth-child(1)","coords":{"top":19229.28125,"left":437.75,"height":16,"width":91.0625},"font":{"font":"italic 14px / 22.4px sans-serif","color":"rgb(51, 102, 204)","size":"14px","style":"italic"},"label":null,"text":"Brood parasite","nodeValue":"Brood parasite","siblingText":["Main article:"]},{"type":"navigation","to":"https://en.wikipedia.org/wiki/Brood_parasite","timestamp":1700422743131},{"type":"value","timestamp":1700422775407,"clickX":405,"clickY":155,"tagName":"SPAN","role":null,"selector":"LI#ca-talk > A:nth-child(1) > SPAN:nth-child(1)","coords":{"top":149.640625,"left":390.90625,"height":16,"width":24.90625},"font":{"font":"14px sans-serif","color":"rgb(51, 102, 204)","size":"14px","style":"normal"},"label":null,"text":"Talk","nodeValue":"Talk","siblingText":["Article","Read","View source","View history","Tools"],"name":"defaultValue","parsing":{"type":"text","format":null}},{"type":"click","timestamp":1700422778049,"clickX":1205,"clickY":28,"tagName":"INPUT","role":"button","selector":"INPUT#vector-user-links-dropdown-checkbox","coords":{"top":17,"left":1185,"height":32,"width":32},"font":{"font":"13.3333px Arial","color":"rgb(0, 0, 0)","size":"13.3333px","style":"normal"},"label":"Personal tools","text":"","nodeValue":"","siblingText":["Main menu","Search","Create account","Log in","Personal tools"]},{"type":"input","timestamp":1700422778063,"valueChanged":true,"value":"on","frame":"https://en.wikipedia.org/wiki/Brood_parasitism","tagName":"INPUT","role":"button","selector":"INPUT#vector-user-links-dropdown-checkbox","coords":{"top":17,"left":1185,"height":32,"width":32},"font":{"font":"13.3333px Arial","color":"rgb(0, 0, 0)","size":"13.3333px","style":"normal"},"label":"Personal tools","text":"","nodeValue":"","siblingText":["Main menu","Search","Create account","Log in","Personal tools"]},{"type":"click","timestamp":1700422779659,"clickX":1055,"clickY":138,"tagName":"A","role":null,"selector":"LI#pt-anontalk > A:nth-child(1)","coords":{"top":126,"left":1016,"height":28,"width":200},"font":{"font":"14px sans-serif","color":"rgb(51, 102, 204)","size":"14px","style":"normal"},"label":null,"text":"Talk","nodeValue":"","siblingText":["Talk"]},{"type":"navigation","to":"https://en.wikipedia.org/wiki/Special:MyTalk","timestamp":1700422779838}]

    // const recorder =  await Recorder.instance("chqBalance", "https://en.wikipedia.org/wiki/Main_Page",
    // {
    //     SearchFor: "Chicken",
    // });
    // await new Promise(resolve => setTimeout(resolve, 40 * 1000));
    // const r = await recorder.setRequiredValue();
    // console.log("We got " + r.text)
    // await recorder.disconnected;
    // events = recorder.events;

    await replayEvents("chqBalance", events as AnyEvent[], {
        SearchFor: "Chicken",
    })
})();


