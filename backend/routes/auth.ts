import express from 'express'
const router = express.Router()
import * as z from 'zod'
import { prisma } from '../db'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const registerschema = z.object({
    email: z.string().email(),
    password: z.string().min(4)
})

router.post('/signup', async (req, res, next) => {
    const { email, password } = registerschema.parse(req.body);
    if (!registerschema) {
        return res.status(401).json("invalid input")
    }
    try {
        const check = await prisma.user.findUnique({
            where: {
                email: email
            }
        })
        if (check) {
            return res.status(401).json("The user already exists");
        }
        else {
            const hashpassword = await bcrypt.hash(password, 10);
            const createuser = await prisma.user.create({
                data: {
                    email: email,
                    passwordHash: hashpassword
                }
            })
            console.log(createuser)
            return res.status(200).json("The user created sucessfully")
        }
    }
    catch (e) {
        console.log(e)
    }
})

router.post('/login', async (req, res, next) => {
    const { email, password } = registerschema.parse(req.body);
    const check = await prisma.user.findUnique({
        where: {
            email: email
        }
    })
    if (check) {
        const checkpassword = await bcrypt.compare(password, check.passwordHash);
        if (checkpassword) {
            const token = jwt.sign({ id: check.id }, process.env.JWT_SECRET || 'secret')
            return res.status(200).json(token);
        }
        else {
            return res.status(401).json("The password is wrong")
        }
    }
    else {
        return res.status(401).json("The user does not exists")
    }
})

export default router