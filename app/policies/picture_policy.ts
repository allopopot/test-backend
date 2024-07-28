import User from '#models/user'
import Picture from '#models/picture'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class PicturePolicy extends BasePolicy {
    edit(user: User, picture: Picture): AuthorizerResponse {
        return user.id === picture.user_id || [1,true].includes(user.isAdmin)
    }

    get(user: User, picture: Picture): AuthorizerResponse {
        return user.id === picture.user_id || [1,true].includes(user.isAdmin)
    }

    delete(user: User, picture: Picture): AuthorizerResponse {
        return user.id === picture.user_id || [1,true].includes(user.isAdmin)
    }
}