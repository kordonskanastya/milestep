const express = require('express');
const {
  createEvent,
  getAllUserEvents,
  deleteEvent,
  getAllEvents,
  updateEvent,
  getEventById,
  addToProfile,
  getUserByEmail,
  addUserToEvent
} = require('../db');
const { decryptToken } = require('../utils');

const pages = express.Router();

pages.get('/protected', async (req, res) => {
    if (req.user) {
      const token = req.cookies.accessToken;
      const allEvents = await getAllUserEvents(token);
        res.render('protected', {
          title: 'Events list',
          isIndex: true,
          allEvents
        });
    } else {
        res.render('login', {
            message: 'Please login to continue',
            messageClass: 'alert-danger'
        });
    }
});

pages.get('/create', (req, res) => {
  if (req.user) {
      res.render('create');
  } else {
      res.render('login', {
          message: 'Please login to continue',
          messageClass: 'alert-danger'
      });
  }
});

pages.post('/create', async (req, res) => {
  if (req.user) {
    const {title, text, dataOfEvent, time} = req.body;
    const token = req.cookies.accessToken;
    const flag = await createEvent({
      title,
      text,
      dataOfEvent,
      time,
      token
    });
    if (!flag) {
      res.render('create');
    }
    res.redirect('protected');
  } else {
      res.render('login', {
          message: 'Please login to continue',
          messageClass: 'alert-danger'
      });
  }
});

pages.post('/delete', async (req, res) => {
  if (req.user) {
    const {id} = req.body;
    await deleteEvent(id);
    res.redirect('protected');
  } else {
      res.render('login', {
          message: 'Please login to continue',
          messageClass: 'alert-danger'
      });
  }
});

pages.get('/allEvents', async (req, res) => {
  if (req.user) {
    const allEvents = await getAllEvents();
      res.render('allEvents', {
        title: 'Events list',
        isIndex: true,
        allEvents
      });
  } else {
      res.render('login', {
          message: 'Please login to continue',
          messageClass: 'alert-danger'
      });
  }
});

pages.post('/allEvents/submit', async (req, res) => {
  if (req.user) {
    const token = req.cookies.accessToken;
    await addUserToEvent(req.body, token);
    res.render('submitEvent');
  } else {
      res.render('login', {
          message: 'Please login to continue',
          messageClass: 'alert-danger'
      });
  }
});

pages.post('/update', async (req, res) => {
  if (req.user) {
    const body = await getEventById(req.body.id);
    res.render('update', {body});
  } else {
      res.render('login', {
          message: 'Please login to continue',
          messageClass: 'alert-danger'
      });
  }
});

pages.post('/update2', async (req, res) => {
  if (req.user) {
    await updateEvent(req.body);
    res.redirect('protected');
  } else {
      res.render('login', {
          message: 'Please login to continue',
          messageClass: 'alert-danger'
      });
  }
});

pages.get('/profile', async (req, res) => {
  if (req.user) {
    const token = req.cookies.accessToken;
    const {email} = decryptToken(token);
    const body = await getUserByEmail(email);
    res.render('profile', {body});
  } else {
      res.render('login', {
          message: 'Please login to continue',
          messageClass: 'alert-danger'
      });
  }
});

pages.post('/profile', async (req, res) => {
  if (req.user) {
    const token = req.cookies.accessToken;
    const flag = await addToProfile(req.body, token);
    if (!flag) {
      res.render('profile');
    }
    res.redirect('allEvents');
  } else {
      res.render('login', {
          message: 'Please login to continue',
          messageClass: 'alert-danger'
      });
  }
});

module.exports = pages;
