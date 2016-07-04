'use strict';

const partials = ['index', 'projects', 'about', 'contact'];

module.exports = [
  {
    output: 'index',
    data: {
      title: 'Home',
      page: 'index'
    },
    partials: 'index'
  },
  {
    output: 'about',
    data: {
      title: 'About',
      page: 'about'
    },
    partials: 'about'
  },
  {
    output: 'contact',
    data: {
      title: 'Contact',
      page: 'contact'
    },
    partials: 'contact'
  },
  {
    output: 'services',
    data: {
      title: 'Serviices',
      page: 'services'
    },
    partials: 'services'
  }
];
