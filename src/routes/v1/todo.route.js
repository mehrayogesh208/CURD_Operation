const express = require("express");
const router = express.Router();
const Todos = require("../../models/todo.model");

/**
 * Get all TODOS:
 * curl http://localhost:8082/v1/todos
 *
 * Get todos with their "startDate" b/w startDateMin and startDateMax
 * curl http://localhost:8082/v1/todos?startDateMin=2020-11-04&startDateMax=2020-12-30
 * 
 */

 router.get("/", async (req, res) => {
   if (req.query.startDateMax && req.query.startDateMin) {
     let startDateMax = new Date(req.query.startDateMax);
     startDateMax.setTime(startDateMax.getTime());
     let startDateMin = new Date(req.query.startDateMin);
     startDateMin.setTime(startDateMin.getTime());
     Todos.find(
       {
         startDate: {
           $lte: startDateMax,
           $gte: startDateMin,
         },
       },
       (err, allTodos) => {
         if (err) {
           console.log(err);
         } else {
         res.send(allTodos);
         }
       }
     );
   } else {
     Todos.find({}, (err, allTodos) => {
       if (err) {
         console.log(err);
         res.status(500).send();
       } else {
         res.send(allTodos);
       }
     });
   }
 
 });
 

/**
 * Add a TODO to the list
 * curl -X POST http://localhost:8082/v1/todos \
    -d '{"name": "Learn Nodejs by doing","startDate": "2021-01-07","endDate": "2021-01-09"}' \
    -H 'Content-Type: application/json'
*/
router.post("/", async (req, res) => {
   const newTodo = {name:req.body.name,
   startDate:req.body.startDate,
   endDate:req.body.endDate}
   try{
      const result = await Todos.create(newTodo)
      res.send(result)
   }
   catch(err){
      res.status(500).json({"message":`Error ${err}`})
   }
   
});

/**
 * Update an existing TODO
 * curl -v -X PUT http://localhost:8082/v1/todos \
    -d '{"_id": "<id-value>", "name": "Play tennis","startDate": "2021-01-07","endDate": "2021-01-09"}' \
    -H 'Content-Type: application/json'
 * 
 * Nb: You'll need to change the "id" value to that of one of your todo items
*/
router.put("/", (req, res) => {
   const idToUpdate = req.body._id;
   const contentToUpdate = {
   name:req.body.name,
   startDate:req.body.startDate,
   endDate:req.body.endDate
   }
   Todos.findByIdAndUpdate(idToUpdate,contentToUpdate,{new:true},(err,doc)=>{
      if(err){
         res.status(500).json({message:err})
      }
      else if(!doc){
         res.status(400).json({message:`Todod with ${idToUpdate}`})
      }
      else{
         res.send(doc)
      }
   })
});

/**
 * Delete a TODO from the list
 * curl -v -X "DELETE" http://localhost:8082/v1/todos/<id-value>
 *
 * Nb: You'll need to change "<id-value>" to the "id" value of one of your todo items
 */
router.delete("/:id", (req, res) => {
   const idToDelete = req.params.id
   Todos.findByIdAndDelete(idToDelete,(err,doc)=>{
      if(err){
         res.status(400).send({"message":err})
      }
      else if(!doc){
         res.status(500).send({"message":"No Todo found"})
      }
      else{
         res.status(204).send(doc)
      }
   })
});

module.exports = router;
