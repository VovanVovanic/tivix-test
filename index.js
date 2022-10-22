import express from 'express'
import mongoose from 'mongoose'

const app = express()
const PORT = 4444


async function start() {
 try {
  await mongoose.connect("mongodb+srv://admin:vlad@cluster0.oilzy.mongodb.net/budget?retryWrites=true&w=majority",
   {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
  ).then(() => console.log("success"))
  
  app.listen(PORT, () => {
   console.log("server started")
  })
  
 }catch(e){console.log(e);}
}
start()