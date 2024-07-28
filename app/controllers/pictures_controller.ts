import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { randomUUID } from 'crypto';
import Picture from '#models/picture'
import { unlink } from 'fs';
import PicturePolicy from '#policies/picture_policy';

export default class PicturesController {
    async get({ response, params, auth, bouncer }: HttpContext) {
        try {
            const user = auth.getUserOrFail()
            if (!params.id) { throw new Error("ID not provided") }
            const picture = await Picture.query().select("*").where("id", params.id).andWhere("is_deleted", false).firstOrFail()
            if (await bouncer.with(PicturePolicy).denies("get", picture)) {
                return response.forbidden("Cannot Access resource.")
            }
            picture.filename =  `http://${process.env.HOST}:${process.env.PORT}/pictures/${picture.filename}`
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
            const picturesQuery = Picture.query().select("id", "user_id", "name", "filename").andWhere("is_deleted", false).orderBy("id", 'desc').limit(10)
            if (!user.isAdmin) { picturesQuery.where("user_id", user.id) }
            !lastIdCursor ? null : picturesQuery.andWhere("id", "<", parseInt(lastIdCursor))
            var pictures = await picturesQuery.exec()
            pictures = pictures.map(el=>{
                el.filename = `http://${process.env.HOST}:${process.env.PORT}/pictures/${el.filename}`
                return el
            })
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

    async delete({ response, params, auth, bouncer }: HttpContext) {
        try {
            auth.getUserOrFail()
            if (!params.id) { throw new Error("ID not provided") }
            const picture = await Picture.query().where("id", params.id).andWhere("is_deleted", false).firstOrFail()
            if (await bouncer.with(PicturePolicy).denies("delete", picture)) {
                return response.forbidden("Cannot Access resource.")
            }
            if (!picture) {  new Error("Picture does not exist") }
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

    async edit({ request, response, auth, params, bouncer }: HttpContext) {
        try {
            const user = auth.getUserOrFail()
            const body = request.body()
            const file = request.file("picture")

            if (!params.id) { throw new Error("ID not provided") }
            const picture = await Picture.query().where("id", params.id).andWhere("user_id", user.id).andWhere("is_deleted", false).firstOrFail()
            if (await bouncer.with(PicturePolicy).denies("edit", picture)) {
                return response.forbidden("Cannot Access resource.")
            }
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