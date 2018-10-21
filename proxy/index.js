const fetch = require("node-fetch");
const express = require("express");

const URL = "https://api.meetup.com";
const PAGE = 200;




let app = express();

app.get("/membership", async (req, res) => {
  const { meetups } = req.query;
  if (meetups) {
    try {
      let result = await fetchMemberships(meetups.split(","));
      res.send({ items: flatten(result) });
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  } else {
    res.status(500).send({ msg: "Parameter {meetups} missing." });
  }
});

app.get("/attendance", async (req, res) => {
  const { meetups } = req.query;
  if (meetups) {
    try {
      let result = await fetchAllMeetupsParticipants(meetups.split(","));
      res.send({ items: flatten(result) });
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  } else {
    res.status(500).send({ msg: "Parameter {meetups} missing." });
  }
});

const fetchMemberships = meetups => {
  return Promise.all(meetups.map(fetchMembership));
};

const fetchMembership = meetup => {
  return fetchMeetup(meetup).then(m => {
    if (!m.members) {
      console.error(`Error fetching ${meetup} info ${JSON.stringify(m)}`);
      return Promise.resolve([]);
    }
    return fetchPagedMembers(m);
  });
};

const fetchAllMeetupsParticipants = meetups => {
  return Promise.all(meetups.map(fetchMeetupsParticipants));
};

const fetchMeetupsParticipants = meetup => {
  return fetchMeetup(meetup).then(m => {
    return fetchMeetupEvents(meetup).then(events => {
      if (events.errors) {
        console.error(
          `Error fetching ${meetup} events ${JSON.stringify(events)}`
        );
        return Promise.resolve([]);
      }
      return Promise.all(
        events.map(fetchEventParticipants.bind(this, meetup, m.id))
      );
    });
  });
};

const fetchEventParticipants = (meetup, meetupId, event) => {
  let pages = Math.floor(event.yes_rsvp_count / PAGE) + 1;
  return Promise.all(
    Array.from(new Array(pages), (val, idx) => {
      return fetchEventParticipantsPage(meetup, event.id, PAGE, idx).then(
        participants => {
          if (participants.errors) {
            return Promise.resolve([]);
          }
          return participants.map(e => {
            return Object.assign({}, e, {
              event: event,
              meetup: meetup,
              meetupId: meetupId
            });
          });
        }
      );
    })
  );
};

const fetchEventParticipantsPage = (meetup, eventId, page, offset) => {
  page = page || PAGE;
  offset = offset || 0;

  return fetch(
    `${URL}/${meetup}/events/${eventId}/rsvps?page=${page}&offset=${offset}`
  ).then(r => r.json());
};

const fetchPagedMembers = meetup => {
  let pages = Math.floor(meetup.members / PAGE) + 1;
  return Promise.all(
    Array.from(new Array(pages), (val, idx) => {
      return fetchMeetupMembers(meetup.urlname, PAGE, idx).then(
        mapMembership.bind(this, meetup)
      );
    })
  );
};

const mapMembership = (meetup, members) => {
  return members.map(member => {
    return {
      member: member,
      meetup: meetup
    };
  });
};

const fetchMeetupEvents = meetup => {
  return fetch(`${URL}/${meetup}/events?page=200&status=past`).then(
    r => r.json()
  );
};
const fetchMeetup = meetup => {
  return fetch(`${URL}/${meetup}?fields=topics`).then(r => r.json());
};

const fetchMeetupMembers = (meetup, page, offset) => {
  page = page || PAGE;
  offset = offset || 0;
  return fetch(`${URL}/${meetup}/members?page=${page}&offset=${offset}`).then(
    r => r.json()
  );
};
const flatten = arr =>
  arr.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);

app.listen(8080);
