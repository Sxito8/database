const { end } = require("../db");

const usermodels = {
    getUsers: `
    SELECT 
    * 
    FROM 
    user`,

    getByID: `
    SELECT
    *
    FROM
    user
    WHERE
    id= ?
    `,

}

module.exports = usermodels;