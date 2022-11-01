import UserSchema from '../schemas/User.js'
import { validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


export const register = async (req, res) => {
 try {
   const errors = validationResult(req)
   if (!errors.isEmpty()) {
     return res.status(400).json(errors.array())
   }
   const pass = req.body.password
   const salt = await bcrypt.genSalt(10)
   const passwordHash = await bcrypt.hash(pass, salt)
   const doc = new UserSchema({
     email: req.body.email,
     nickname: req.body.nickname,
     password: passwordHash
   })
   const user = await doc.save()

   const token = jwt.sign({
     _id: user._id
   }, 'secret123', { expiresIn: '7d' })

   const { password, ...data } = user._doc
   return res.json({
     ...data,
     token,
     expiresIn: new Date(new Date().setDate(new Date().getDate() + 7))
   })
 }
 catch (e) {
   res.json({ e })
 }
}

export const login = async (req, res) => {

 try {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array())
  }
   const user = await UserSchema.findOne({ email: req.body.email })

   if (!user) {
     return res.status(404).json({ message: "User Not found" })
   }

   const isValidPass = await bcrypt.compare(req.body.password, user._doc.password)
   if (!isValidPass) {
     return res.status(404).json({ message: "Password error" })
   }

   const token = jwt.sign({
     _id: user._id
   }, 'secret123', { expiresIn: '7d' })

   const { password, ...data } = user._doc
   return res.json({
     ...data,
     token,
     expiresIn: new Date(new Date().setDate(new Date().getDate() + 7))
   })

 } catch (e) {
   res.status(500).json({ message: "Something gonna wrong", e })
 }
}

export const getMe = async (req, res) => {
 try {
   const user = await UserSchema.findById(req.userId);
  
   if (!user) {
     return res.status(404).json({
       message: ' The user is not found',
     });
  }
  const token = jwt.sign({
   _id: user._id
 }, 'secret123', { expiresIn: '30d' })

   const { passwordHash, ...userData } = user._doc;

   return res.json({...userData, token});
 } catch (err) {

   res.status(500).json({
     message: 'No Access',
   });
 }
}

export const edit = async (req, res) => {
 try {
   const errors = validationResult(req)
   if (!errors.isEmpty()) {
     return res.status(400).json(errors.array())
  }
  const pass = req.body.password
  const salt = await bcrypt.genSalt(10)
  const passwordHash = await bcrypt.hash(pass, salt)

   await UserSchema.updateOne(
     {
       _id: req.userId,
     },
     {
       nickname: req.body.nickname,
       email: req.body.email,
       password: passwordHash,
     },
   );

   res.json({
     success: true,
   });
 } catch (err) {
   console.log(err);
   res.status(500).json({
     message: 'Could not update user info',
   });
 }
}

export const remove = async (req, res) => {
 try {
   const id = req.userId;

   UserSchema.findOneAndDelete(
     {
       _id: id,
     },
     (err, doc) => {
       if (err) {
         return res.status(500).json({
           message: 'Could not delete user',
         });
       }

       if (!doc) {
         return res.status(404).json({
           message: 'The user is not found',
         });
       }

       res.json({
         success: true,
       });
     },
   );
 } catch (err) {
   res.status(500).json({
     message: err,
   });
 }
}
