import { Injectable } from '@nestjs/common';
import * as lowdb from 'lowdb';
import * as FileAsync from 'lowdb/adapters/FileAsync';
import * as uuid from 'uuid';

type DataStore = 'auths';

@Injectable()
export class DatabaseService {
    private db: lowdb.LowdbAsync<any>;

  constructor() {
    this.initDatabase('auths');
  }

  private async initDatabase(dataStore: DataStore) {
    const adapter = new FileAsync('db.json');
    this.db = await lowdb(adapter);
    const getUsers = await this.db.get(dataStore).value();
    if (!getUsers) {
      await this.db.set(dataStore, []).write();
    }
  }

  
}