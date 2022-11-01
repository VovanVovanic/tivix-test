import express from 'express'
import mongoose from 'mongoose'
import { registerValidation, loginValidation, budgetValidation } from './src/validations/validators.js'
import { checkAuth } from './src/middlwares/auth.js'
import cors from 'cors'
import * as user from './src/routes/user.js';
import * as budget from './src/routes/budget.js';

export const app = express()
app.use(express.json())
app.use(cors());
const PORT = 4444


async function start() {
  try {
    await mongoose.connect("mongodb+srv://admin:vlad@cluster0.oilzy.mongodb.net/budget?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    ).then(() => console.log("success"))

    ///users
    app.post('/user/register', registerValidation, user.register)
    app.post('/user/login', loginValidation, user.login)
    app.get('/user/me', checkAuth, user.getMe);
    app.put('/user/edit', checkAuth, registerValidation, user.edit)
    app.delete('/user/remove', checkAuth, user.remove)

    ///budgets
    app.post('/budgets/create_budget', checkAuth, budgetValidation, budget.createBudget);
    app.get('/budgets/get_shared_with_me', checkAuth, budget.getShared);
    app.delete('/budgets/remove/:id', checkAuth, budget.removeBudget);
    app.put('/budgets/edit/:id', checkAuth, budgetValidation, budget.updateBudget)
    app.get('/budgets/my_budgets', checkAuth, budget.getMyBudgets)
    app.get('/budgets/my_budgets_filtered', checkAuth, budget.filterMyBudgets)
    app.get('/budgets/friend_budget', checkAuth, budget.getFriendBudgets)
    

    app.listen(PORT, () => {
      console.log("server started")
    })

  } catch (e) { console.log(e); }
}
start()