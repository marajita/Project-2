module.exports = function(sequelize, DataTypes) {
  var Character = sequelize.define("Character", {
    character_name: DataTypes.STRING,
    hp: DataTypes.INTEGER,
    attack: DataTypes.INTEGER
  });
  Character.associate = function(models) {
    Character.belongsTo(models.Item, {
      foreignKey: {
        allowNull: false
      }
    });
  };

  return Character;
};