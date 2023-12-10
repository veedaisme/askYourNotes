import { MongoClient } from 'mongodb';
import config from '../../config';

const { mongoDbUser, mongodbPassword } = config;

const uri = `mongodb+srv://${mongoDbUser}:${mongodbPassword}@veeda-dev.ellu317.mongodb.net/?retryWrites=true&w=majority`;

const mongoDbClient = new MongoClient(uri);

mongoDbClient.connect();

export default mongoDbClient;
