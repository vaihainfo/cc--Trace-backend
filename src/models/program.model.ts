import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';

const Program = db.define('programs',{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  program_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  program_status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

Program.associate = (models: any) => {
  Program.hasMany(models.Farmer, {
    foreignKey: 'program_id',
    as: 'program',
  });

  Program.hasMany(models.Transaction, {
    foreignKey: 'program_id',
    as: 'program',
  });
};

export default Program;