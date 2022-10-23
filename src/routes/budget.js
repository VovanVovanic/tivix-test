import UserSchema from '../schemas/User.js'
import BudgetSchema from '../schemas/Budget.js'


export const createBudget = async (req, res) => {
 try {
  const user = await UserSchema.findById(req.userId)
  const { title, share_with, description, expenses, incomes } = req.body

  const newBudget = new BudgetSchema({
   title,
   creator: user.nickname,
   share_with,
   description,
   expenses,
   incomes
  })
  await newBudget.save()
  await UserSchema.findByIdAndUpdate(req.userId, {
   $push: { budgets: newBudget }
  })

  return res.json(newBudget)

 }
 catch (e) {
  res.json({ e })
 }
}

export const getShared = async (req, res) => {
 try {
  const user = await UserSchema.findById(req.userId)
  const username = user.nickname
  const sharedBudgets = await BudgetSchema.find({
   "share_with": {
    $elemMatch: {
     name: username
    }
   }
  }
  )
console.log(username, "name")
  sharedBudgets.forEach((el) => {
   el.expenses = el.expenses.filter((e) => {
    if (e.share_with.length) {
     return { ...e }
    }
   }).filter((f) => f.share_with.some((s) => s.name === username))

   el.incomes = el.incomes.filter((e) => {
    if (e.share_with.length) {
     return { ...e }
    }
   }).filter((f) => f.share_with.some((s) => s.name === username))
  })

  return res.json(sharedBudgets)

 }
 catch (e) {
  res.json({ e })
 }
}