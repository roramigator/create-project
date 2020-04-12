const express = require('express');
const cors = require('cors');
const request = require('request');

const app = express();

app.use(cors());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/', (req, res) => {
  const url = req.query.url || "";
  // console.log(`Requesting... ['${url}']`); /***SERVER FEEDBACK***/
  request(
    { url: url },
    (error, response, body) => {
      if (error || response.statusCode !== 200) {
        // console.log('Error... [bad request]'); /***SERVER FEEDBACK***/
        return res.status(400).json({ type: 'error', message: 'bad request' })
      }
      // console.log('Reached...... [responding]'); /***SERVER FEEDBACK***/
      try{
        res.status(200).json(JSON.parse(body));
        // console.log('Sending...... [json]'); /***SERVER FEEDBACK***/
      }
      catch(e){
         res.status(409).json({type:'error', message: 'could not parse response', response: body});
         // console.log('Sending...... [error]'); /***SERVER FEEDBACK***/
      }
      // console.log('Successful... [ok]'); /***SERVER FEEDBACK***/
    }
  )
});

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`Running... [http://localhost:${PORT}/]`));
