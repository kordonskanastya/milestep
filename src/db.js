const { Pool } = require('pg');
const { postgres: config } = require('./config');
const { decryptToken, newDateFormat } = require('./utils');

const client = new Pool(config);

async function createUser ({
  firstName,
  lastName,
  email,
  password
}) {
  try {
    const emailUser = await client.query(
      'Select email from users where email=$1 ', [email]);
    if(emailUser.rows.length!==0){
      throw new Error(`ERROR:Email ${email} is defined,
        please try another email`);
    } else {
      const res = await client.query(
        `INSERT INTO users(id, firstName, lastName, email, password)
       VALUES (DEFAULT, $1, $2, $3, $4)
       RETURNING *`,
        [firstName, lastName, email, password],
      );
      return res.rows[0];
    }
  } catch (err) {
    console.error(err.message || err);
    throw err;
  }
};

async function getUserByEmail (email) {
  try {
   const res = await client.query(
      'SELECT * From users WHERE email like $1',
      [`%${ email }%`],
    );
    return res.rows[0];
  } catch (err) {
    console.error(err.message || err);
    throw err;
  }
};

async function createEvent ({
  title,
  text,
  dataOfEvent,
  time,
  token
}) {
  try {
    const {email} = decryptToken(token);
    const {id} = await getUserByEmail(email);
    const res = await client.query(
      `INSERT INTO events(id, title, text, date, time, fk_user_id)
      VALUES (DEFAULT, $1, $2, $3, $4, $5)
      RETURNING *`,
      [title, text, dataOfEvent, time, id],
    );
    return res.rows[0];
  } catch (err) {
    console.error(err.message || err);
    throw err;
  }
};

async function getAllUserEvents (token) {
  try {
    const {email} = decryptToken(token);
    const {id} = await getUserByEmail(email);
    const boolFalse = 'false';
    const res = await client.query(
      'SELECT * FROM events WHERE fk_user_id = $1 AND deleted = $2',
      [id, boolFalse]);
    res.rows.forEach((obj) => {
      // eslint-disable-next-line no-param-reassign
      obj.date = obj.date.toDateString();
    });
    return res.rows;
  } catch (err) {
    console.error(err.message || err);
    throw err;
  }
};

async function deleteEvent (id) {
  try {
    const boolTrue = 'true';
    const res = await client.query(
      `UPDATE events SET deleted=$1
      WHERE id = $2`,
      [boolTrue, id]
    );
    return res.rows[0];
  } catch (err) {
    console.error(err.message || err);
    throw err;
  }
};

async function getAllEvents () {
  try {
    const boolFalse = 'false';
    const res = await client.query(
      'SELECT * FROM events WHERE deleted = $1',
      [boolFalse]);
    res.rows.forEach((obj) => {
      // eslint-disable-next-line no-param-reassign
      obj.date = obj.date.toDateString();
    });
    return res.rows;
  } catch (err) {
    console.error(err.message || err);
    throw err;
  }
};

async function updateEvent (body) {
  try {
    const res = await client.query(
      `UPDATE events SET title = $1, text = $2, date = $3, time = $4
      WHERE id = $5`,
      [body.title, body.text, body.dataOfEvent, body.time, body.id]
    );
    return res.rows[0];
  } catch (err) {
    console.error(err.message || err);
    throw err;
  }
};

async function getEventById (id) {
  try {
    const res = await client.query(
      'SELECT * FROM events WHERE id = $1',
      [id]);
    res.rows[0].date = newDateFormat(res.rows[0].date);
    return res.rows[0];
  } catch (err) {
    console.error(err.message || err);
    throw err;
  }
};

async function addToProfile (body, token) {
  try {
    const {email} = decryptToken(token);
    const {id} = await getUserByEmail(email);
    const res = await client.query(
      `UPDATE users SET firstname = $1, lastname = $2, interests = $3,
      job = $4, university_degree = $5, description = $6
      WHERE id = $7`,
      [body.firstName, body.lastName, body.interests,
        body.job, body.univDegree, body.description, id]
    );
    return res.rows;
  } catch (err) {
    console.error(err.message || err);
    throw err;
  }
};

async function addUserToEvent (body, token) {
  try {
    const {email} = decryptToken(token);
    const {id} = await getUserByEmail(email);
    const res = await client.query(
      `INSERT INTO joinevents(id, fk_user_id)
      VALUES ($1, $2)
      RETURNING *`,
      [body.id, id]
    );
    return res.rows[0];
  } catch (err) {
    console.error(err.message || err);
    throw err;
  }
};

module.exports = {
  createUser,
  getUserByEmail,
  createEvent,
  getAllUserEvents,
  deleteEvent,
  getAllEvents,
  updateEvent,
  getEventById,
  addToProfile,
  addUserToEvent
};
