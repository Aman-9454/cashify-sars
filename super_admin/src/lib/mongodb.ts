import { MongoClient, MongoClientOptions, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb+srv://adarshsachan9967_db_user:aQCPwwzcilQGVHhU@camsik.oxiqz3o.mongodb.net';
const defaultDbName = process.env.MONGODB_MASTER_DB || 'casmik_saas_platform';

const options: MongoClientOptions = {
  maxPoolSize: 15,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromiseSuperAdmin: Promise<MongoClient> | undefined;
}

if (!uri) {
  throw new Error('Please define MONGODB_URI inside .env');
}

export function getClientPromise(): Promise<MongoClient> {
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromiseSuperAdmin) {
      client = new MongoClient(uri, options);
      global._mongoClientPromiseSuperAdmin = client.connect();
    }
    return global._mongoClientPromiseSuperAdmin;
  }
  if (!clientPromise) {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
  return clientPromise;
}

export async function getDatabase(dbName?: string): Promise<Db> {
  const connectedClient = await getClientPromise();
  return connectedClient.db(dbName || defaultDbName);
}

