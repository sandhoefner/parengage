// Refer to the JavaScript quickstart on how to setup the environment:
// https://developers.google.com/google-apps/calendar/quickstart/js
// Change the scope to 'https://www.googleapis.com/auth/calendar' and delete any
// stored credentials.

var event = {
  'summary': 'Call Fundraiser',
  'location': 'Works at Home',
  'description': 'Call these numbers to help fundraise for the school',
  'start': {
    'dateTime': '2016-04-28T09:00:00-07:00',
    'timeZone': 'America/Boston'
  },
  'end': {
    'dateTime': '2016-04-28T17:00:00-07:00',
    'timeZone': 'America/Boston'
  }
};

var request = gapi.client.calendar.events.insert({
  'calendarId': 'primary',
  'resource': event
});

request.execute(function(event) {
  appendPre('Event created: ' + event.htmlLink);
});