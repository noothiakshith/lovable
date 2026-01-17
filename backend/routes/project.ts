import express from 'express'
import verifyUser from '../middleware'
import { prisma } from '../db'
import { id } from 'zod/locales'
const router = express.Router()

router.post('/', verifyUser, async (req, res, next) => {
    const { name } = req.body
    const userid = req.userId

    if (!userid) {
        return res.status(401).json({ error: 'User not authenticated' })
    }

    try {
        const newproject = await prisma.project.create({
            data: {
                name: name || "Untitled Project",
                userId: userid,
                sandboxId: "testing for now"

            }
        })
        res.status(201).json(newproject)
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Failed to create project' })
    }
})


router.get('/:id', verifyUser, async (req, res, next) => {
    const projectid = req.params.id as string
    if (!projectid) {
        return res.status(401).json("Make sure project is there")
    }
    else {
        try {
            const check = await prisma.project.findFirst({
                where: {
                    userId: req.userId,
                    id: projectid
                },
                include:{
                    files:true
                }
            })
            return res.status(200).json(check);
        }
        catch (err) {
            console.log(err)
        }
    }
})
export default router