// Supplied by the client on 15 November 2026 from the previous ikonectt.com
// testimonial carousel. The original cards are retained intact as source assets.
export const customerStories = [
 ['Daniel Chukwuma','Gamer & Streamer','Perfect for Gaming','Omo !!! just what I need for serious online gaming sessions.',5],
 ['Zainab Lawal','Project Manager','Reliable for Remote Work','Working from home is stress-free now. No interruptions, no buffering just stable connection.',5],
 ['Ahmed Yusuf','','Family Friendly','Everyone in the house can stream, browse, and work online all at the same time.',4],
 ['Kunle Ojo','','Affordable Plans','For the value Ikonectt offers, their pricing is unmatched. I cut my internet costs by half.',5],
 ['Chinonso Eze','Café Owner','Boosted My Business','My café now runs smoother, and I’ve seen more customers staying longer thanks to fast Wi-Fi.',5],
 ['Bola Martins','Data Analyst','Dependable Connection','Rain or shine, my connection stays strong. That’s rare in Nigeria.',4],
 ['Tosin Adewale','Software Developer','Fast Connection','Ikonectt’s internet is blazing fast. I can stream, download, and attend video meetings without a single lag.',3],
 ['Akin Dunilo','YouTuber','Great for Creators','I upload large videos to YouTube in minutes now. Ikonectt changed the game for me.',5],
].map(([name,descriptor,title,quote,rating],index)=>({
 name,descriptor,title,quote,rating,
 portrait:{src:new URL(`./images/customers/story-${index+1}.png`,import.meta.url).href,alt:index===2?'Connected household illustration':name},
 approval:{quote:true,attribution:true,publication:true,portrait:true,rating:true},
 source:`https://ikonectt.com/wp-content/uploads/2025/10/${['drdrrrdd','drdedttd','drdedd','drdddd','drddd','drd','dfddf','dd'][index]}-1024x389.png`,
}));
