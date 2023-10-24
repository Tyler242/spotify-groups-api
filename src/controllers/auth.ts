import type { NextFunction, Request, Response } from 'express'
import connect from '../models/connect'
import UserModel from '../models/User'
import { sign } from 'jsonwebtoken'
import type TokenObject from '../models/TokenObject'
import { config } from 'dotenv'
import { compare, hash } from 'bcrypt'

config()

export async function signup(req: Request, res: Response, next: NextFunction) {
    const email = req.body.email
    const password = req.body.password
    const spotifyUuid = req.body.spotifyUuid

    if (!password || !spotifyUuid || !email) {
        const err = new Error('Invalid Body')
        next(err)
    }

    const db = await connect()
    const userExists = await db.model('User').findOne({ email, spotify_uuid: spotifyUuid })
    if (userExists) {
        next(Error('User aleady exists')); return
    }

    let hashedPassword: string
    try {
        hashedPassword = await hashPassword(password)
    } catch (err) {
        next(err); return
    }

    const userModel = new UserModel({
        email,
        password: hashedPassword,
        spotify_uuid: spotifyUuid
    })

    const user = await db.model('User').create(userModel)

    let tokenObject: TokenObject
    try {
        tokenObject = createJwtToken(user)
    } catch (err) {
        next(err); return
    }

    const userWithToken = await db.model('User').findByIdAndUpdate(user._id, { auth_token: tokenObject }, { returnDocument: 'after' })

    return res.status(201).json({ userId: userWithToken._id, token: userWithToken.auth_token.token })
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
    const email = req.body.email
    const password = req.body.password
    const spotifyUuid = req.body.spotifyUuid

    const db = await connect()
    const user = await db.model('User').findOne({ email, spotify_uuid: spotifyUuid })
    if (!user) {
        next(Error('User doesn\'t exist')); return
    }

    const isValidPassword = await comparePassword(password, user.password)
    if (!isValidPassword) {
        next(Error('Invalid Username & Password combination')); return
    }

    let tokenObject: TokenObject
    try {
        tokenObject = createJwtToken(user)
    } catch (err) {
        next(err); return
    }

    const userWithUpdatedToken = await db.model('User').findByIdAndUpdate(user._id, { auth_token: tokenObject }, { returnDocument: 'after' })

    return res.status(201).json({ userId: userWithUpdatedToken._id, token: userWithUpdatedToken.auth_token.token })
}

export function refresh() {
    console.log('TODO refresh')
}

function createJwtToken(user: any): TokenObject {
    const tokenObj: TokenObject = {
        token: '',
        expires_in_minutes: 0
    }

    const expires_in = '2h'
    tokenObj.token = sign(
        {
            userId: user._id,
            spotifyUuid: user.spotify_uuid,
            email: user.email
        },
        process.env.jwt_secret!,
        {
            expiresIn: expires_in
        }
    )
    tokenObj.expires_in_minutes = 120

    return tokenObj
}

async function hashPassword(password: string): Promise<string> {
    return await hash(password, 12)
}

async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await compare(password, hashedPassword)
}
