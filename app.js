const express=require("express");
const path=require("path");
const {open}=require("sqlite");
const sqlite3=require("sqlite3");
const format=require("date-fns/format");
const ismatch=require("date-fns/isMatch");
var isValid=require("date-fns/isValid");
const { request } = require("http");
const { isMatch } = require("date-fns");

const app=express();

let priority_arr=["HIGH","MEDIUM","LOW"];
let status_arr=["TO DO","IN PROGRESS","DONE"];
let category_arr=["WORK","HOME","LEARNING"];
let db=null;
const initialize=async()=>{

try{
db=await open({
filename:path.join(__dirname,"todoApplicationsDb"),
driver:sqlite3.Database,

});
app.listen(3000,()=>{
    console.log("db is running at localhost")
})

    
}catch(error){
console.log(`db is not connected ${error.message}`);
process.exit(1);
}

};
initialize();


//api 1

const priority_status=(requestQuery)=>(

    requestQuery.priority !== undefined &&requestQuery.status !==undefined
);
const priority_category=(requestQuery)=>(

    requestQuery.priority !== undefined &&requestQuery.category !==undefined
);
const search_only=(requestQuery)=>(

    requestQuery.search_q!== undefined
);
const status_only=(requestQuery)=>(

    requestQuery.status !== undefined
);

const priority_only=(requestQuery)=>(

    requestQuery.priority !== undefined
);
const category_only=(requestQuery)=>(

    requestQuery.category !== undefined
);
const status_category=(requestQuery)=>(

    requestQuery.status !== undefined &&requestQuery.category !==undefined
);

const outputResult = (dbObject) => ({
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    category: dbObject.category,
    status: dbObject.status,
    dueDate: dbObject.due_date
});


//api 1
app.get("/todos/",async (request,response)=>{
let data=null;
let getTodosQuery="";
const {search_q = "", priority, status, category}=request.query;

switch(true){
case priority_category(request.query):

    if (priority_arr.includes(priority) && status_arr.includes(status)){
        getTodosQuery = `select * from todo where category='${priority}' and status='${status}';`;
        data = await db.all(getTodosQuery);
        response.send(data.map((eachItem) => outputResult(eachItem)));
    }else{

        response.status(400);
        response.send("Invalid Todo Status or category");
    }
    break;



case status_category(request.query):

    if (category_arr.includes(category) && status_arr.includes(status)){
        getTodosQuery = `select * from todo where category='${category}' and status='${status}';`;
        data = await db.all(getTodosQuery);
        response.send(data.map((eachItem) => outputResult(eachItem)));
    }else{

        response.status(400);
        response.send("Invalid Todo Status or category");
    }
    break;

case priority_status(request.query):

if (status_arr.includes(status) && priority_arr.includes(priority)){
    getTodosQuery = `select * from todo where status='${status}' and priority='${priority}';`;
    data = await db.all(getTodosQuery);
    response.send(data.map((eachItem) => outputResult(eachItem)));
}else{

    response.status(400);
    response.send("Invalid Todo Status or category");
}
break;

case status_only(request.query):

if (status_arr.includes(status)){
    getTodosQuery = `select * from todo where status='${status}';`;
    data = await db.all(getTodosQuery);
    response.send(data.map((eachItem) => outputResult(eachItem)));
}else{

    response.status(400);
    response.send("Invalid Todo Status or category");
}
break;

case priority_only(request.query):

if (priority_arr.includes(priority)){
    getTodosQuery = `select * from todo where priority='${priority}';`;
    data = await db.all(getTodosQuery);
    response.send(data.map((eachItem) => outputResult(eachItem)));
}else{

    response.status(400);
    response.send("Invalid priority");
}
break;
case category_only(request.query):

if (category_arr.includes(category)){
    getTodosQuery = `select * from todo where category='${category}';`;
    data = await db.all(getTodosQuery);
    response.send(data.map((eachItem) => outputResult(eachItem)));
}else{

    response.status(400);
    response.send("Invalid priority");
}
break;


case search_only(request.query):
    getTodosQuery=`select * from todo where todo like '%${search_q}%'`;
    data=await db.all(getTodosQuery);
    response.send(data.map((eachItem)=>outputResult(eachItem)));
    break;



default:
    getTodosQuery=`select * from todo`;
    data=await db.all(getTodosQuery);
    response.send(data.map((eachItem)=>outputResult(eachItem)));
    break;


}

});

app.get("/todos/:todoId/",async(request,response)=>{
    const {todoId}=request.params;

 getTodosQuery=`select * from todo where id='${todoId};' `;
 data=await db.get(getTodosQuery);
 response.send(data.map((eachItem)=>outputResult(eachItem)));

});
//api 3
app.get("/todos/",async(request,response)=>{
    const {date}=request.query;
if(isMatch(date,"yyyy-MM-dd")){
const newDate=format(new Date(date),"yyyy-MM-dd");
const requestQuery=`select * from todo where date=${newDate}`;
data=await db.get(requestQuery);
response.send(data.map((eachItem)=>outputResult(eachItem)));

}
})
app.post("/todos/",async(request,response)=>{

const {id,todo,priority,status,category,dueDate}=request.body;
if (priority_arr.includes(priority)&& status_arr.includes(status) && category_arr.includes(category)){
    if(isMatch(date,"yyyy-MM-dd")){
        const newDate=format(new Date(date),"yyyy-MM-dd");
        const requestQuery=`insert into todo (id, todo, category,priority, status, due_date)
        VALUES
          (${id}, '${todo}', '${category}','${priority}', '${status}', '${postNewDueDate}');`;
data=await db.run(requestQuery);
response.send(data.map((eachItem)=>outputResult(eachItem)));
await db.run(postTodoQuery);
//console.log(responseResult);
response.send("Todo Successfully Added");
}else{

    response.status(400);
    response.send("Invalid Due Date");
}
}else{
    response.status(400);
    response.send("Invalid todo properties");
}

});


app.put("/todos/:todoId/", async (request, response) => {
    const { todoId } = request.params;
    let updateColumn = "";
    const requestBody = request.body;
    console.log(requestBody);
    const previousTodoQuery = `SELECT * FROM todo WHERE id = ${todoId};`;
    const previousTodo = await db.get(previousTodoQuery);
    const {
      todo = previousTodo.todo,
      priority = previousTodo.priority,
      status = previousTodo.status,
      category = previousTodo.category,
      dueDate = previousTodo.dueDate,
    } = request.body;
  
    let updateTodoQuery;
    switch (true) {
      // update status
      case requestBody.status !== undefined:
        if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
          updateTodoQuery = `
      UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}', category='${category}',
       due_date='${dueDate}' WHERE id = ${todoId};`;
  
          await db.run(updateTodoQuery);
          response.send(`Status Updated`);
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
        break;
  
      //update priority
      case requestBody.priority !== undefined:
        if (priority === "HIGH" || priority === "LOW" || priority === "MEDIUM") {
          updateTodoQuery = `
      UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}', category='${category}',
       due_date='${dueDate}' WHERE id = ${todoId};`;
  
          await db.run(updateTodoQuery);
          response.send(`Priority Updated`);
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
        break;
  
      //update todo
      case requestBody.todo !== undefined:
        updateTodoQuery = `
      UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}', category='${category}',
       due_date='${dueDate}' WHERE id = ${todoId};`;
  
        await db.run(updateTodoQuery);
        response.send(`Todo Updated`);
        break;
  
      //update category
      case requestBody.category !== undefined:
        if (
          category === "WORK" ||
          category === "HOME" ||
          category === "LEARNING"
        ) {
          updateTodoQuery = `
      UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}', category='${category}',
       due_date='${dueDate}' WHERE id = ${todoId};`;
  
          await db.run(updateTodoQuery);
          response.send(`Category Updated`);
        } else {
          response.status(400);
          response.send("Invalid Todo Category");
        }
        break;
      //update due date
      case requestBody.dueDate !== undefined:
        if (isMatch(dueDate, "yyyy-MM-dd")) {
          const newDueDate = format(new Date(dueDate), "yyyy-MM-dd");
          updateTodoQuery = `
      UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}', category='${category}',
       due_date='${newDueDate}' WHERE id = ${todoId};`;
  
          await db.run(updateTodoQuery);
          response.send(`Due Date Updated`);
        } else {
          response.status(400);
          response.send("Invalid Due Date");
        }
        break;
    }
  
    /*updateTodoQuery = `
      UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}', category='${category}',
       due_date='${dueDate}' WHERE id = ${todoId};`;
  
    const responseData = await db.run(updateTodoQuery);
    response.send(`${updateColumn} Updated`);*/
  });
  


