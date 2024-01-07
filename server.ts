import express, { Express } from 'express';
import mongoose, { ConnectOptions } from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';

import auth from './routes/Auth'
import user from './routes/User';
import post from './routes/Posts'

const app: Express = express();
const port = 3001;

const DB_URI = "mongodb://localhost:27017"
const options: ConnectOptions = {
    dbName: "ig",
}

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use("/auth", auth)
app.use("/user", user)
app.use("/post", post)

mongoose.connect(DB_URI, options).then(() => {
    console.log(`⚡ | Database connection successful`);
}).catch((error) => {
    console.log(error);
})

app.listen(port, () => {
    console.log(`⚡ | Server is running at http://localhost:${port}`);
})
