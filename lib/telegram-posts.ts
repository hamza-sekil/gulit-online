// Telegram channel posts (Amharic + English), each with a picture or the delivery video served from gulitonline.com/social/.
// They rotate in order. Captions: Telegram HTML (<b>, <i>, <a>), max 1024 characters.
export type Post = { text: string; photo?: string; video?: string };
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
];
