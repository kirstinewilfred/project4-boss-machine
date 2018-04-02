const checkMillionDollarIdea = ( req, res, next ) => {
  if ( checkValidInput(req.body) ) {
    const yield = req.body.weeklyRevenue * req.body.numWeeks;
    if ( 1000000 > yield ){
      res.status(400).send();
    } else {
      next();
    }
  } else {
    res.status(400).send();
  }

};

function checkValidInput( idea ){
  let isValid = true;
  if ( undefined === idea.weeklyRevenue || undefined === idea.numWeeks ) {
    isValid = false;
  }
  if ( isNaN( Number( idea.weeklyRevenue ) ) || isNaN( Number( idea.numWeeks ) ) ) {
    isValid = false;
  }
  return isValid;
}


// Leave this exports assignment so that the function can be used elsewhere
module.exports = checkMillionDollarIdea;
