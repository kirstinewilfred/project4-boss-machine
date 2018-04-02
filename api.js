const express = require('express');
const apiRouter = express.Router();

const logger = require('morgan');
apiRouter.use(logger('dev'));

const database = require('./db');
const checkMillionDollarIdea = require('./checkMillionDollarIdea')


//helper function for setting params
function setParamByModel ( req, res, next, id, modelName ){
  const item = database.getFromDatabaseById( modelName, id );
  if (!item) {
    res.status(404).send();
  } else {
    switch (modelName) {
      case 'minions':
        req.minion = item;
        break;
      case 'ideas':
        req.idea = item;
        break;
      case 'work':
        req.work = item;
        break;
      } //end switch
    next();
  } //end else
}

apiRouter.param('minionId', (req, res, next, id) => {
  setParamByModel ( req, res, next, id, 'minions' )
});

apiRouter.param('ideaId', (req, res, next, id) => {
  setParamByModel ( req, res, next, id, 'ideas' )
});

apiRouter.param('workId', (req, res, next, id) => {
  setParamByModel ( req, res, next, id, 'work' )
});

//helper function for getting all items from the database
function getAllFromDB ( req, res, next, modelName ) {
  const arrayFromDb = database.getAllFromDatabase(modelName);
  if ( null !== arrayFromDb ){
    res.send(arrayFromDb);
  } else {
    res.status(404).send(`No ${modelName} where found`);
  }
}

apiRouter.get('/minions', (req, res, next) => {
  getAllFromDB ( req, res, next, 'minions' );
})

apiRouter.get('/ideas', (req, res, next) => {
  getAllFromDB ( req, res, next, 'ideas' );
})

apiRouter.get('/meetings', (req, res, next) => {
  getAllFromDB ( req, res, next, 'meetings' );
})

apiRouter.get('/minions/:minionId/work', (req, res, next) => {
  const everyMinionsWorkArray = database.getAllFromDatabase('work');
  if ( null !== everyMinionsWorkArray ){
    const result = everyMinionsWorkArray.filter(work => work.minionId === req.minion.id );
    res.send(result);
  } else {
    res.status(404).send(`No work was found`);
  }
})


apiRouter.get('/minions/:minionId', (req, res, next) =>{
  res.send(req.minion);
});

apiRouter.get('/ideas/:ideaId', (req, res, next) =>{
  res.send(req.idea);
});

//helper function for updating item in database
function updateItemInDatabase ( req, res, next, modelName ){
  const updatedItem = req.body;
  let originalId;
  switch (modelName) {
    case 'minions':
      originalId = req.minion.id;
      break;
    case 'ideas':
      originalId = req.idea.id;
      break;
    case 'work':
      originalId = req.work.id;
      break;
  } //end switch
  if ( originalId !== updatedItem.id ){
    res.status(400).send(`Cannot update ${modelName}, invalid id`);
  } else {
    res.send( database.updateInstanceInDatabase(modelName, updatedItem ) );
  }
}
apiRouter.put('/minions/:minionId', (req, res, next) =>{
  updateItemInDatabase ( req, res, next, 'minions' );
});

apiRouter.put('/ideas/:ideaId', checkMillionDollarIdea, (req, res, next) =>{
  updateItemInDatabase ( req, res, next, 'ideas' );
});

apiRouter.put('/minions/:minionId/work/:workId', (req, res, next) =>{
  updateItemInDatabase ( req, res, next, 'work' );
});

//helper function for adding new item to the addToDatabase
function addItemToDB ( req, res, next, modelName ){
  const newItem = req.body;
  //error handling if invalid values in properties
  try {
    const addedItem = database.addToDatabase(modelName, newItem);
    res.status(201).send(addedItem);
  } catch (err) {
    next(err);
  }
}

apiRouter.post('/minions', (req, res, next) => {
  addItemToDB ( req, res, next, 'minions' );
});

apiRouter.post('/ideas', checkMillionDollarIdea, (req, res, next) => {
  addItemToDB ( req, res, next, 'ideas' );
});

apiRouter.post('/meetings', (req, res, next) => {
  req.body = database.createMeeting();
  addItemToDB ( req, res, next, 'meetings' );
});

apiRouter.post('/minions/:minionId/work', (req, res, next) => {
  addItemToDB ( req, res, next, 'work' );
})

//helper function for deleting
function deleteFromDatabase( modelName, res, id) {
  if ( 'meetings' === modelName ){
    database.deleteAllFromDatabase('meetings');
  } else {
    database.deleteFromDatabasebyId(modelName, id);
  }
  res.status(204).send();
}

apiRouter.delete('/minions/:minionId', (req, res, next) => {
  deleteFromDatabase( 'minions', res, req.minion.id );
});

apiRouter.delete('/ideas/:ideaId', (req, res, next) => {
  deleteFromDatabase( 'ideas', res, req.idea.id );
});

apiRouter.delete('/minions/:minionId/work/:workId', (req, res, next) => {
  deleteFromDatabase( 'work', res, req.work.id );
});

apiRouter.delete('/meetings', (req, res, next ) => {
  deleteFromDatabase( 'meetings', res );
});



apiRouter.use((err, req, res, next) => {
  if (!err.status) {
    err.status = 500;
  }
  console.log(err.message);
  res.status(err.status).send(err.message);
});

module.exports = apiRouter;
