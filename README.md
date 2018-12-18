# DragPaper

A self-hosted read-it-later service based on dropbox paper.

## Why

For years I use Instapaper for my read-it-later service. It's clean, steady, and has brilliant reading experience across devices. However, as a usual situtation for a product of a commercial company, Instapaper has its drawbacks which a user can hardly resolved, and something even bad after it roll out the premium program. 

First of all, I subscribe a lot services like Apple Mucis, Medium, Evernote and so on. I only use Instapaper as a clip tools, I would store all the good articles in my Evernote. So the Instapaper Premium, which has functions like full-text search, text-to-speech, send to Kindle, is not what i needed. So I think I will not join Instapaper Premium.

Based on the situation, the Instapaper service has something that I can not bear:

### Really slow bug fix

Around Feb 2018, I found the copy function can't used in my android phone, I created a ticket about the problem, and received a quick reply that they had known the issue and were working on it. And after three whole months, a new version finally roll out. But I've switched to iPhone at that time 😂.

### Only 5 note monthly for free account

I have a lot things to mark, and 5 is far away from enough.

### Can't edit the clipped result

Sometimes I want modify the article for either better reading experience or some complement for the main article. Instapaper never allow me to do it.

### Not good enough clip result for some sites

---

So I build this tools for my own purpose, the main goals of the tools will be:

- Clip every website like Instapaper or even better
- Clip across all devices
- The clipped article can be edited
- Comment and highlight functions with unlimited usaged

## Why Dropbox paper

Build a rich text editor from scratch is a had job. And there are many existed text edit tools I can use to implement my godls.

I'm also a dropbox user. I like dropbox paper very much. Dropbox paper has API to save article, has highlight & comment, has nice App in iOS and Android. Why not use it?

And technically, any text edit tools which has API for save files can be replace dropbox paper. This is also the benifit.

---

## System implements

### dragpaper-web

A DragPaper server is the main funtional module in DragPaper. It manage dropbox auth infomation, do webpage clipping job and save the cliped result to your own dropbox paper folder.

You must run dragpaper-web service in your own VPS. Nodejs 10+ enviroment is needed.

#### config.json

Generate config.json from config.example.json.

A server can only accept single user login and single dropbox authorization.

Some variable explanation: 

- account.username: When use dragpaper-web, the server need you do a login, set your login username here.
- account.password: Set your login password here. Need MD5 encrypted.
- dropbox.email: Your dropbox account email address.
- dropbox.folder: The folder id where you want save the clip result. You can get it easily from url like `https://paper.dropbox.com/folder/show/${FOLDER_NAME}-${FOLDER_ID}` 

#### Start server

```bash
NODE_ENV=production npm run build
NODE_ENV=production node dist/index.js
```

### dragpaper-clip

A chrome extension where you can easily clip webpage in browser. Download it [here](https://chrome.google.com/webstore/detail/dragpaper-clip/feljdodpjonecpcmdddgafcphnnmochj).

### iOS Clipping

I use a shortcut for my clip in iOS. No need another App😁.

### Android Clipping

No need current now...