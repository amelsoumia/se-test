// Get the functions in the db.js file to use
const db = require('./../services/db');

class Programme {

    id;
    name;

    constructor(id) {
        this.id = id;
    }

    async getProgrammeName() {

        if (typeof this.name !== 'string') {
            var sql = "SELECT * from Programmes where id = ?"
            const results = await db.query(sql, [this.id]);
            this.name = results[0].name;
        }
    }

}

module.exports = {
    Programme
};