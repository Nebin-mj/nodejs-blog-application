# Node Js Express Blog Post Application

A blog application using node js with express library.  
Users can read, post and update blogs.  
Mongo DB is used as the database, accessed through mongoose library for node js.  
Passport Js cookie session based authentication.  
Server side webpage rendering using handlebars(using express-handlebars library)  
Frontend styling using bootstrap.

### To start the server run:

`npm i`  
Create a public folder in the root directory withing which create a images folder.  
Create a `.env` file at the root directory of the project and add values MONGO_URI and SESSION_SECRET to it then run:  
 `npm start`

To star the server using nodemon run:  
 `npm run dev`  
The web app will be available on http://localhost:5000  
