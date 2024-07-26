import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { randomUUID } from 'crypto';
import Picture from '#models/picture'
import { unlink } from 'fs';


export default class PicturesController {
    async get({ response, params, auth }: HttpContext) {
        try {
            const user = auth.getUserOrFail()
            if (!params.id) { throw new Error("ID not provided") }
            const picture = await Picture.query().select("*").where("id", params.id).andWhere("user_id", user.id).andWhere("is_deleted", false).firstOrFail()
            response.status(200).json(picture)
        } catch (error) {
            response.status(400).json({
                errors: [
                    {
                        message: error.message
                    }
                ]
            })
        }
    }

    async list({ request, response, auth }: HttpContext) {
        try {
            const lastIdCursor: any = request.qs()?.lastIdCursor
            const user = auth.getUserOrFail()
            const picturesQuery = Picture.query().select("id", "user_id", "name", "filename").where("user_id", user.id).andWhere("is_deleted", false).orderBy("id", 'desc').limit(10)
            !lastIdCursor ? null : picturesQuery.andWhere("id", "<", parseInt(lastIdCursor))
            const pictures = await picturesQuery.exec()
            response.status(200).json(pictures)
        } catch (error) {
            response.status(400).json({
                errors: [
                    {
                        message: error.message
                    }
                ]
            })
        }
    }

    async add({ request, response, auth }: HttpContext) {
        try {
            const body = request.body()
            const user = auth.getUserOrFail()

            const file = request.file("picture", {
                size: '5mb',
                extnames: ['jpg', 'png', 'jpeg']
            })

            const randomFileName = `${randomUUID().toString()}.${file?.extname}`
            file?.move(app.makePath('public/pictures'), {
                name: randomFileName
            })

            const pic = new Picture()
            pic.user_id = user.id
            pic.name = body.name
            pic.description = body.description
            pic.filename = randomFileName
            await pic.save()
            response.created(pic)
        } catch (error) {
            response.status(400).json({
                errors: [
                    {
                        message: error.message
                    }
                ]
            })
        }
    }

    async delete({ response, params, auth }: HttpContext) {
        try {
            const user = auth.getUserOrFail()
            if (!params.id) { throw new Error("ID not provided") }
            const picture = await Picture.query().where("id", params.id).andWhere("user_id", user.id).andWhere("is_deleted", false).first()
            if (!picture) { throw new Error("Picture does not exist") }
            picture.is_deleted = true
            await picture.save()
            response.status(200).json(picture)
        } catch (error) {
            response.status(400).json({
                errors: [
                    {
                        message: error.message
                    }
                ]
            })
        }
    }

    async edit({ request, response, auth, params }: HttpContext) {
        try {
            const user = auth.getUserOrFail()
            const body = request.body()
            const file = request.file("picture")

            if (!params.id) { throw new Error("ID not provided") }
            const picture = await Picture.query().where("id", params.id).andWhere("user_id", user.id).andWhere("is_deleted", false).firstOrFail()

            if (body?.name) { picture.name = body.name }
            if (body?.description) { picture.description = body.description }
            if (file !== null) {

                unlink(app.makePath(`public/pictures/${picture.filename}`), (error) => {
                    if (error) { console.log(error) }
                })
                const randomFileName = `${randomUUID().toString()}.${file?.extname}`
                picture.filename = randomFileName
                file?.move(app.makePath('public/pictures'), {
                    name: randomFileName
                })
            }

            await picture.save()
            response.status(200).json(picture)

        } catch (error) {
            response.status(400).json({
                errors: [
                    {
                        message: error.message
                    }
                ]
            })
        }
    }
}