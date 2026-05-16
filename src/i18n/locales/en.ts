export default {
  nav: {
    home: 'Home',
    about: 'About',
    createEvent: 'Create Event',
  },
  hero: {
    title: 'MovieWiz',
    tagline: 'Find and organize movie nights near you',
    getStarted: 'Get Started',
  },
  features: {
    discover: {
      title: 'Discover Events',
      desc: 'Find movie screenings and gatherings in your area.',
      btn: 'Learn More',
    },
    create: {
      title: 'Create Events',
      desc: 'Organize your own movie night with friends.',
      btn: 'Create Now',
    },
  },
  createEvent: {
    title: 'Create an Event',
    subtitle: 'Fill in the details below to organize your movie night.',
    popup: {
      successTitle: 'Event created successfully!',
      successDesc: 'You can now access your event:',
      readLink: 'View event (read-only)',
      writeLink: 'Edit event',
      errorTitle: 'Failed to create event',
      errorDefault: 'An error occurred. Please try again.',
    },
    contact: {
      title: 'Contact Information',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
    },
    details: {
      title: 'Event Details',
      eventName: 'Event Name',
      date: 'Date',
      comments: 'Comments',
      commentsPlaceholder: 'Optional notes about the event...',
    },
    verification: {
      title: 'Verification',
    },
    submit: 'Create Event',
  },
  eventPage: {
    title: 'Event',
    access: {
      title: 'Access Your Event',
      desc: 'Enter the token from your invitation link to view event details.',
      placeholder: 'Paste your token here',
      btn: 'View Event',
    },
    loading: 'Loading event details...',
    notFound: {
      title: 'Event Not Found',
      desc: 'This event could not be found or the token is invalid.',
    },
    goHome: 'Go Home',
    fields: {
      date: 'Date',
      contact: 'Contact',
      email: 'Email',
      address: 'Address',
      comments: 'Comments',
    },
    legend: {
      event: 'Event',
    },
    participants: {
      title: 'Participants',
      empty: 'No participants yet. Be the first to register!',
      table: {
        name: 'Name',
        mode: 'Mode',
        phone: 'Phone',
        email: 'Email',
        address: 'Address',
        location: 'Location',
        date: 'Registration date',
      },
      driver: 'Driver',
      passenger: 'Passenger',
    },
  },
  editEvent: {
    title: 'Edit Event',
    subtitle: 'Update the details below to modify your movie night.',
    loading: 'Loading event details...',
    notFound: {
      title: 'Event Not Found',
      desc: 'This event could not be found or the edit token is invalid.',
    },
    popup: {
      successTitle: 'Event updated successfully!',
      successDesc: 'Your event has been saved.',
      errorTitle: 'Failed to update event',
      errorDefault: 'An error occurred. Please try again.',
    },
    submit: 'Save Changes',
  },
  about: {
    title: 'This is it',
  },
  registerParticipant: {
    toggle: 'Register for this event',
    submit: 'Register',
    markerLabel: 'Your address',
    contact: {
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
    },
    details: {
      title: 'Details',
      mode: 'Mode',
      driver: 'Driver',
      passenger: 'Passenger',
      phoneNumber: 'Phone Number',
      comments: 'Comments',
      commentsPlaceholder: 'Optional notes...',
      hideEmail: 'Hide my email from other participants',
      notifyMe: 'Notify me of new registrations',
      location: 'Your Location',
    },
    popup: {
      successTitle: 'Registration successful!',
      successDesc: 'You have been registered for this event.',
      errorTitle: 'Registration failed',
      errorDefault: 'An error occurred. Please try again.',
    },
  },
  common: {
    address: {
      label: 'Address',
      placeholder: 'Start typing an address...',
    },
    captcha: {
      title: 'Verification',
      placeholder: 'Enter captcha',
      refresh: 'Refresh',
    },
  },
}
