import { body } from 'express-validator'

export const registerValidation = [
 body('password', "required field").not().isEmpty().trim().escape(),
 body('nickname', "required field").not().isEmpty().trim().escape(),
 body('email', "required field").not().isEmpty().trim().escape(),
 body('email', "Wrong email format").isEmail(),
 body('password', "Minimum password length is 5").isLength({ min: 5 }),
 body('nickname', "Minimum nickname length is 2").isLength({ min: 2 }),
]

export const loginValidation = [
 body('password', "required field").not().isEmpty().trim().escape(),
 body('email', "required field").not().isEmpty().trim().escape(),
]

export const budgetValidation = [
 body('title', "required field").not().isEmpty().trim().escape(),
 body('title', "Minimum title length is 2").isLength({ min: 2 }),
 body('expenses', "at least one option must be chosen").not().isEmpty(),
 body('incomes', "at least one option must be chosen").not().isEmpty(),
]