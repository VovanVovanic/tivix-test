import mongoose from 'mongoose'

const subSchemaShare = new mongoose.Schema({
 name: {
  type: String, required: true
 },
})

const subSchema = new mongoose.Schema({
 category: {
  type: String, required: true
 },
 share_with: [
  {
   type: subSchemaShare,
  }
 ],
 amount: { type: Number, required: true }
});

const BudgetSchema = new mongoose.Schema({
 title: {
  type: String,
  required: true
 },
 creator: { type: String, required: true },
 description: {
  type: String,
  default: ""
 },
 share_with: [
  {
   type: subSchemaShare,
  }
 ],
 expenses: [
  {
   type: subSchema,
   required:true
  }
 ],
 incomes: [
  {
   type: subSchema,
   required:true
  }
 ],
 user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User'
 },
}, {
 timestamps: true
})

export default mongoose.model('Budget', BudgetSchema)


