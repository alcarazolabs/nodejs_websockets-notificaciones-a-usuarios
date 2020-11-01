const router = require('express').Router()

const Task = require('../model/task')
const Notification = require('../model/notification')

var ObjectId = require('mongoose').Types.ObjectId; //para buscar por tipo ObjectId


router.get('/mytasks', async (req, res) => {
    const iduser = req.query.iduser;
    try{
        const result = await Task.find({iduser: new ObjectId(iduser)}).sort({date: 'desc'})
            res.status(201).json(result);
    
        }catch(error){
            return res.status(202).json({error: error.message});
        }

});
router.post('/register', async (req, res) => {
    //console.log(req.app.locals.io) //io object
    //const io = req.app.locals.io
    var io = req.app.get('socketio');
    
    try{
        //obtener id para luego pasarlo al evento
        const iduser = new ObjectId(req.query.iduser)
        //Crear tarea
        const task = await Task.create(req.query)
        if(!task){
            return res.send({error: true, data:"fail to create task"})
        }
        //verificar si existe notificacion para dicho usuario
        const notificado = await Notification.findOne({iduser: new ObjectId(req.query.iduser)})
        if(notificado){
            //Actualizar su estado de notificado luego de que se le registro tarea.
            await Notification.findByIdAndUpdate(notificado._id, {
                status: 1,
            });
        }else{
            //Crear notificacion por primera vez
            var obj = {
                status: 1,
                iduser: req.query.iduser
            }
            //Crear notificacion en la bd.
            const n = await Notification.create(obj)
        }
    
        //objeto notificacion para enviar al usuario
        var task_notification = {
            idtask: task._id,
            iduser: iduser,
            name: task.name,
            date: task.date,
        }
 
       //Emitir evento al cliente con la notificacion
        io.emit('newUserTaskNotification-'+iduser, task_notification)

        return res.send({error: false, data:"ok"})

        }catch(error){
            return res.send({error: error.message})
        }

});


router.get('/task_notification_status', async (req, res) => {
      //get status of Notification of the user
    try{
        const result = await Notification.findOne({iduser: new ObjectId(req.query.iduser)})
   
        if(result){
            res.status(201).json({error:false, status:result.status});
        }
    
        }catch(error){
            return res.status(202).json({error: error.message});
        }

});

router.post('/change_user_notification_status', async (req, res) => {

    try{
       const result = await Notification.findOneAndUpdate({iduser:req.body.iduser}, {
            status: 0,
        });
        if(result){
            return res.send({error: false, data:"ok"})
        }else{
            return res.send({error: true, data:"no"})
        }
    }catch(error){
        return res.send({error: error.message})
    }

});


router.post('/change_task_status', async (req, res) => {

    try{
        const result = await Task.findByIdAndUpdate(req.body.idtask, {
            status: 0,
        });
        if(result){
            return res.send({error: false, data:"ok"})
        }else{
            return res.send({error: true, data:"no"})
        }
    }catch(error){
        return res.send({error: error.message})
    }

});


module.exports = router;
