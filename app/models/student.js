
// Get the functions in the db.js file to use
const db = require('./../services/db');

const { Programme } = require('./programme');
const { Module } = require('./module');
class Student {
    // Student ID
    id;
    // Student name
    name;
    // Student programme
    programme;
    // Student modules
    modules = [];

    constructor(id) {
        this.id = id;
    }

    async getStudentName() {

        if (typeof this.name !== 'string') {
            var sql = "SELECT * from Students where id = ?"
            const results = await db.query(sql, [this.id]);
            this.name = results[0].name;
        }

    }

    async getStudentProgramme() {

        if (!this.programme) {

            const sql = `
            SELECT programme
            FROM Student_Programme
            WHERE id = ?
        `;

            const results = await db.query(sql, [this.id]);

            if (results.length > 0) {

                const pid = results[0].programme;

                this.programme = new Programme(pid);

                await this.programme.getProgrammeName();

            }

        }

    }

    async getStudentModules() {

        if (this.modules.length === 0 && this.programme) {

            const pid = this.programme.id;

            const sql = `
            SELECT module
            FROM Programme_Modules
            WHERE programme = ?
        `;

            const results = await db.query(sql, [pid]);

            for (let row of results) {

                const module = new Module(row.module);

                await module.getModuleName();

                this.modules.push(module);

            }

        }

    }
}

module.exports = {
    Student
}
