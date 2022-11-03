import UserSchema from '../schemas/User.js'
import BudgetSchema from '../schemas/Budget.js'
import { validationResult } from 'express-validator'




export const createBudget = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array())
    }
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

export const removeBudget = async (req, res) => {
  try {
    const Id = req.params.id.slice(1);

    BudgetSchema.findOneAndDelete(
      {
        _id: Id,
      },
      (err, doc) => {
        if (err) {
          return res.status(500).json({
            message: 'Could not delete the budget',
          });
        }

        if (!doc) {
          return res.status(404).json({
            message: 'The budget is not found',
          });
        }

        res.json({
          success: true,
        });
      },
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Could not get budgets',
    });
  }
}


const getSet = (arr, data, key) => {
  const set = new Set(arr.reduce((acc, el) => {
    el[data].forEach((e) => {
      acc.push(e[key])
    })
    return acc
  }, []))
  return set
}


export const getMyBudgets = async (req, res) => {
  try {
    let page

    if (req.query.page) {
      page = parseInt(req.query.page);
    }
    else {
      page = 1
    }
    const limit = 1;
    const skip = (page - 1) * limit;

    const user = await UserSchema.findById(req.userId)
    const total = user.budgets.length
    const username = user.nickname
    const budgetsPaged = await BudgetSchema.find({ creator: username }).skip(skip).limit(limit)
    const budgets= await BudgetSchema.find({ creator: username })
    const users = await BudgetSchema.find({}, "creator")

    const set = new Set(users.map((el) => el.creator))
    const usersArr = [...set]
    const expenses = [...getSet(budgets, "expenses", "category")]
    const incomes = [...getSet(budgets, "incomes", "category")]

    return res.status(200).json({
      data: budgetsPaged,
      users: usersArr,
      iShareTo: [...getSet(budgets, 'share_with', "name")],
      categories: {
        expenses, incomes
      },
      total,
      page
    })
  }
  catch (err) {
    res.status(404).json({
      message: 'Could find budgets',
    })
  }
}


export const filterMyBudgets = async (req, res) => {
  try {
    let page

    if (req.query.page) {
      page = parseInt(req.query.page);
    }
    else {
      page = 1
    }
    const limit = 1;
    const skip = (page - 1) * limit

    const expenses = JSON.parse(req.query.body).expenses
    const incomes = JSON.parse(req.query.body).incomes
    const users = JSON.parse(req.query.body).users
    const creatorKey = users.length && "creator"
    const expensesKey = expenses.length && "expenses"
    const incomesKey = incomes.length && "incomes"

    const user = await UserSchema.findById(req.userId)

    const total = await BudgetSchema.countDocuments({
      creator: user.nickname,
      [creatorKey]: { $in: users },
      [expensesKey]: {
        $elemMatch: { category: { $in: expenses } }
      },
      [incomesKey]: {
        $elemMatch: { category: { $in: incomes } }
      }
    })

    console.log(users, expenses, incomes)

    const budgets = await BudgetSchema.find(
      {
        creator: user.nickname,
        [creatorKey]: { $in: users },
        [expensesKey]: {
          $elemMatch: { category: { $in: expenses } }
        },
        [incomesKey]: {
          $elemMatch: { category: { $in: incomes } }
        }

      }).skip(skip).limit(limit)
    
    console.group(budgets), "ddd"

    return res.json({ data: budgets, total, page })
  }
  catch (e) {
    res.status(404).json({
      message: 'Could find budgets',
    })
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

    const set = new Set(sharedBudgets.map((el) => el.creator))

    return res.json({ data: sharedBudgets, sharedToMe: [...set] })

  }
  catch (e) {
    res.json({ e })
  }
}

export const updateBudget = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array())
    }

    const Id = req.params.id.slice(1);
    await BudgetSchema.updateOne(
      {
        _id: Id,
      },
      {
        ...req.body
      },
    );
    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Could not update budget info',
    });
  }
}

export const getFriendBudgets = async (req, res) => {

  try {
    let page

    if (req.query.page) {
      page = parseInt(req.query.page);
    }
    else {
      page = 1
    }
    const limit = 2;
    const skip = (page - 1) * limit


    const user = await UserSchema.findById(req.userId)
    const username = user.nickname

    const total = await BudgetSchema.countDocuments({
      creator: req.body.creator,
      "share_with": {
        $elemMatch: {
          name: username
        }
      }
    })

    const budgets = await BudgetSchema.find({
      creator: req.body.creator,
      "share_with": {
        $elemMatch: {
          name: username
        }
      }
    }).skip(skip).limit(limit)

    budgets.forEach((el) => {

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

    return res.json({ data: budgets, total })
  }
  catch (e) {
    res.status(404).json({
      message: 'Could not find budgets',
    })
  }
}