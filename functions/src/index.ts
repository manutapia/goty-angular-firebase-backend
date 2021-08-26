import * as functions from "firebase-functions";
import * as admin from 'firebase-admin';

import * as express from 'express';
import * as cors from 'cors';

const serviceAccount = require("./serviceAccountKey.json");


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.json({
    mensaje: "Hola mundo desde funciones de firebase!"
  })
});


export const getGoty = functions.https.onRequest(async(request, response) => {
  const gotyRef = db.collection('goty');
  const docsSnap = await gotyRef.get();
  const videogames = docsSnap.docs.map( doc => doc.data() );

  response.json(videogames)
});

// Express
const app = express();
app.use( cors({origin: true}));

app.get('/goty',async(req,res)=>{
  const gotyRef = db.collection('goty');
  const docsSnap = await gotyRef.get();
  const videogames = docsSnap.docs.map( doc => doc.data() );

  res.json(videogames)
});

app.post('/goty/:id', async(req,res)=>{
  const id = req.params.id;
  const videogameRef = db.collection('goty').doc(id);
  const videogameSnap = await videogameRef.get();

  if (!videogameSnap.exists) {
    res.status(404).json({
      ok: false,
      msg: 'there is no game with that ID: ' + id
    })
  }else{
    const videogame = videogameSnap.data() || {votes: 0};
    await videogameRef.update({
      votes: videogame.votes + 1
    })
    res.json({
      ok: true,
      msg: 'thank you for your vote to '+ videogame.name
    })
  }
})


export const api = functions.https.onRequest( app );