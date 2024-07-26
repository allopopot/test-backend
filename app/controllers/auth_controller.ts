import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class AuthController {
    async login({ request, response }: HttpContext) {
        const { email, password } = request.only(['email', 'password'])
        const user = await User.verifyCredentials(email, password)
        const tokens = await User.accessTokens.create(user, ['*'], { expiresIn: '30 days' })
        response.json({user,tokens})
    }

    async createAccount({ request, response }: HttpContext) {
        const { fullname, email, password } = request.only(['fullname', 'email', 'password'])
        const userExists = await User.query().where("email", "=", email).first()
        if (userExists) {
            response.badRequest({
                errors: [
                    { "message": "An Error has Occurred" }
                ]
            })
        }
        const user = await User.create({ fullName: fullname, email, password })
        response.json(user)

    }
}