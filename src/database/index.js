import Sequelize from 'sequelize';
import databaseConfig from '../config/database';

import User from '../app/models/User';
import File from '../app/models/File';
import Subscription from '../app/models/Subscription';
import Meetup from '../app/models/Meetup';

const models = [User, File, Subscription, Meetup];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.model));
  }
}

export default new Database();
