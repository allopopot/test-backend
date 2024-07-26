/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
const AuthController = () => import('#controllers/auth_controller')
const PicturesController = () => import('#controllers/pictures_controller')
import { middleware } from '#start/kernel'

router.group(() => {


  router.group(() => {
    router.post("/login", [AuthController, 'login'])
    router.post("/register", [AuthController, 'createAccount'])
  }).prefix("/auth")


  router.group(() => {
    router.get("", [PicturesController, 'list'])
    router.post("", [PicturesController, 'add'])
    router.get("/:id", [PicturesController, 'get'])
    router.delete("/:id", [PicturesController, 'delete'])
    router.patch("/:id", [PicturesController, 'edit'])
  }).prefix("/pictures").use(middleware.gate())

}).prefix("/api")