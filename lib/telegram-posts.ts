// Telegram channel posts (Amharic + English), each with a picture or the delivery video served from gulitonline.com/social/.
// They rotate in order. Captions: Telegram HTML (<b>, <i>, <a>), max 1024 characters.
// id: a post can be sent once, right away, by setting telegramPostNow in deploy/gulit.production.json to its id.
export type Post = { id?: string; text: string; photo?: string; video?: string };
export const MEDIA_BASE = 'https://gulitonline.com/social/';
export const POSTS: Post[] = [
{ video: 'gulit-delivery.mp4', text: `🛵 <b>ከሱፐርማርኬት እስከ ቤትዎ!</b>
እኛ ከሚወዱት ሱፐርማርኬት እንገዛለን፣ አሽገን በሞተር ቤትዎ ድረስ እናደርሳለን።

🛵 <b>From the supermarket to your door!</b>
We shop at your favourite Addis supermarket, pack it, and deliver it to your home.
<b>Gulit — coming soon.</b> 🌐 <a href="https://gulitonline.com/tg">gulitonline.com</a>` },
{ photo: 'gulit-01.jpg', text: `🧺 <b>ጉሊት ኦንላይን በቅርብ ቀን!</b>
የሚወዱትን ሱፐርማርኬት ዕቃ ከቤትዎ ሆነው ያዝዙ — እኛ እናደርሳለን።

🧺 <b>Gulit Online is coming soon!</b>
Order from your favourite Addis supermarket from home — we deliver to your door.
🌐 <a href="https://gulitonline.com/tg">gulitonline.com</a>` },
{ photo: 'gulit-02.jpg', text: `📱 <b>ሱፐርማርኬቱ በስልክዎ</b>
ዕቃዎን ይምረጡ፣ ይክፈሉ፣ ያርፉ — እኛ እናደርሳለን።

📱 <b>Your favourite supermarket, on your phone</b>
Pick, pay, relax — our riders deliver across Addis. Coming soon!` },
{ photo: 'gulit-03.jpg', text: `💳 <b>በቴሌብር፣ በሲቢኢ ብር ወይም በካርድ ይክፈሉ</b>
ደህንነቱ የተጠበቀ የኦንላይን ክፍያ።

💳 <b>Pay with Telebirr, CBE Birr or card</b>
Safe online payment, checked before your order moves. Coming soon on Gulit.` },
{ photo: 'gulit-04.jpg', text: `🥬 <b>ፍራፍሬ፣ አትክልት፣ ወተት — ሁሉም በአንድ ቦታ</b>
ቡና፣ ዘይት፣ ስኳር፣ ሳሙና እና የቤት ዕቃዎችም።

🥬 <b>Your weekly shop in one place</b>
Fruit, veg, milk, coffee, oil, soap… What's always on your list? 👇` },
{ photo: 'gulit-05.jpg', text: `✅ <b>ዕቃ ካለቀ እርስዎ ይመርጣሉ</b>
ምትክ ይምረጡ ወይም አይከፍሉበትም። ያለፈቃድዎ ምንም አይቀየርም።

✅ <b>Out of stock? You choose.</b>
Pick a replacement — or don't pay for it. No surprises.` },
{ photo: 'gulit-06.jpg', text: `🔔 <b>ተረጋገጠ ➜ ታሸገ ➜ በመንገድ ላይ ➜ ደረሰ</b>
ትዕዛዝዎን በስልክዎ ይከታተሉ።

🔔 <b>Track every step of your order</b>
Confirmed, packed, on the way, delivered — all on your phone. Coming soon!` },
{ photo: 'gulit-07.jpg', text: `🏪 <b>ሱፐርማርኬት፣ ሱቅ ወይም ዳቦ ቤት አለዎት?</b>
የጉሊት አጋር ይሁኑ — ዋጋዎን እርስዎ ይወስናሉ፣ ኮሚሽኑ 1% ብቻ።

🏪 <b>Own a supermarket, shop or bakery?</b>
Become a Gulit partner before launch. You set your prices, we bring customers and deliver — only 1% commission.
👉 <a href="https://gulitonline.com/partners?s=telegram">gulitonline.com/partners</a>` },
{ photo: 'gulit-08.jpg', text: `🏍️ <b>ሞተር ሳይክል ወይም መኪና አለዎት?</b>
ከጉሊት ጋር በአዲስ አበባ ያድርሱ።

🏍️ <b>Have a motorbike or car?</b>
Join the Gulit delivery team across Addis. Message this channel or call +251909225566.` },
{ photo: 'gulit-09.jpg', text: `🇪🇹 <b>በአማርኛ ወይም በእንግሊዝኛ ይግዙ</b>
በአንድ ንክኪ ቋንቋ ይቀይሩ።

🇪🇹 <b>Shop in Amharic or English</b>
One tap to switch — the whole app follows you. Coming soon!` },
{ photo: 'gulit-10.jpg', text: `🧾 <b>ከመክፈልዎ በፊት ሁሉንም ዋጋ ይመልከቱ</b>
የዕቃ ዋጋ፣ የአገልግሎት ክፍያ እና ማድረሻ በግልጽ። ሱፐርማርኬቶችን አወዳድረው ይቆጥቡ!

🧾 <b>See every birr before you pay</b>
Products, service fee and delivery shown upfront — and compare supermarkets to save. Coming soon to Addis!` },
{ id: 'mep-real-2026-11-10', video: 'gulit-mep-real.mp4', text: `🛠 <b>የቧንቧ፣ የኤሌክትሪክ እና የመካኒካል ሥራ በጉሊት!</b>
ለቤት፣ ለቢሮ እና ለፋብሪካ። ቧንቧ ፈሰሰ? መብራት ተበላሸ? ኤሲ ወይም ቀዝቃዛ ክፍል አይሰራም? ይዘዙ — ባለሙያ መጥቶ አይቶ ዋጋ ይነግርዎታል፤ እርስዎ ሲስማሙ ይሰራል።

🛠 <b>MEP services by Gulit</b>
Plumbing · Electrical · Mechanical — for homes, offices and factories. Leaks, wiring, panels, pumps, AC, cold rooms and chillers. A trusted engineer inspects first and you approve the price before work starts.

👉 <a href="https://gulitonline.com/mep?s=telegram">gulitonline.com/mep</a>
📞 +251 909 225 566 · +251 910 828 617` },
{ id: 'import-2026-11-13', video: 'gulit-import.mp4', text: `✈️ <b>ጉሊት — አስመጣልኝ!</b>
ቤትዎን ለመጨረስ ጊዜ የለዎትም? ሴራሚክ፣ መብራት፣ በር፣ ኪችን፣ የመታጠቢያ ቤት ዕቃዎች... ከቻይና፣ ከቱርክ፣ ከዱባይ ወይም ከየትኛውም አገር እናስመጣለን። ዋጋውን (ዕቃ፣ ጭነት፣ ጉምሩክ፣ ማድረሻ) ከመክፈልዎ በፊት በአንድ ጊዜ እንልካለን።

✈️ <b>Import for me</b>
Too busy to finish your house? Tiles, lighting, doors, kitchens, bathroom fittings — we source them from China, Turkey, Dubai or anywhere, handle shipping and customs, and deliver to your site. One full quote before you pay.

👉 <a href="https://gulitonline.com/import?s=telegram">gulitonline.com/import</a>
📞 +251 909 225 566 · +251 910 828 617` },
{ id: 'suggest-2026-11-14', photo: 'gulit-suggest.jpg', text: `🌴🥗 <b>ውድ የቀድሞ ደንበኞቻችን፣ እንኳን ደህና መጡ!</b>
የሚወዷቸውን <b>የአረብና ጤናማ ምግቦች</b> አስመጥተን ጉሊት ላይ ልናከማች ነው — ቴምር፣ የወይራ ዘይት፣ ታሂኒ፣ ባስማቲ ሩዝ፣ ኦትስ፣ ኪኖዋ፣ ማር፣ ከስኳር ነፃ ምርቶች…
👉 <b>ምን እንዲኖር ይፈልጋሉ?</b> ይጠቁሙን፤ ብዙ የተጠየቀውን ቅድሚያ ሰጥተን እናስመጣለን!
✈️ በኢትዮጵያ የማይገኝ ማንኛውም ዕቃም እናመጣልዎታለን።

🌴🥗 <b>Arabian &amp; healthy foods are coming to Gulit!</b>
Dates, olive oil, tahini, basmati, oats, quinoa, honey, sugar-free products… Tell us what you want stocked — the most-requested items come first. Anything you can't find in Ethiopia, we'll import for you.

💡 <a href="https://gulitonline.com/suggest?s=telegram">gulitonline.com/suggest</a> · ✈️ <a href="https://gulitonline.com/import?s=telegram">gulitonline.com/import</a>
📞 +251 909 225 566` },
];
