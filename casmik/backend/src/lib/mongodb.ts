import { MongoClient, MongoClientOptions, Db, Collection, Document } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb+srv://adarshsachan9967_db_user:aQCPwwzcilQGVHhU@camsik.oxiqz3o.mongodb.net';
const dbName = process.env.MONGODB_DB_NAME || 'casmik';

const options: MongoClientOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

export function getClientPromise(): Promise<MongoClient> {
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  }
  if (!clientPromise) {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
  return clientPromise;
}

/**
 * Returns the connected MongoDB database instance.
 * Defaults to the database name configured in MONGODB_DB_NAME ('casmik').
 */
export async function getDatabase(customDbName?: string): Promise<Db> {
  const connectedClient = await getClientPromise();
  return connectedClient.db(customDbName || dbName);
}

/**
 * Returns a typed MongoDB collection from the Casmik database.
 */
export async function getCollection<T extends Document = Document>(collectionName: string): Promise<Collection<T>> {
  const db = await getDatabase();
  return db.collection<T>(collectionName);
}

export default {
  then(onfulfilled?: any, onrejected?: any) {
    return getClientPromise().then(onfulfilled, onrejected);
  },
  catch(onrejected?: any) {
    return getClientPromise().catch(onrejected);
  },
};
