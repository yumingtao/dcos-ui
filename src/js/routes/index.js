import React from 'react';
import {Route, Redirect} from 'react-router';
import {Hooks} from 'PluginSDK';

import cluster from './cluster';
import components from './components';
import dashboard from './dashboard';
import Index from '../pages/Index';
import Network from './factories/network';
import nodes from '../../../plugins/nodes/src/js/routes/nodes';
import NotFoundPage from '../pages/NotFoundPage';
import Organization from './factories/organization';
import settings from './settings';
import styles from './styles';
import services from '../../../plugins/services/src/js/routes/services';
import jobs from './jobs';
import universe from './universe';

const SidebarGroup = ({children}) => children;

function getApplicationRoutes() {
  // Statically defined routes
  let routes = [].concat(
    {
      path: '/',
      type: Route,
      component: SidebarGroup,
      children: [].concat(
        dashboard,
        services,
        jobs,
        universe,
        styles
      )
    },
    {
      path: '/resources',
      label: 'resources',
      type: Route,
      component: SidebarGroup,
      children: [].concat(
        nodes,
        Network.getRoutes()
      )
    },
    {
      path: '/system',
      label: 'system',
      type: Route,
      component: SidebarGroup,
      children: [].concat(
        cluster,
        components,
        Organization.getRoutes(),
        settings
      )
    }
  );

  routes = [
    {
      type: Route,
      children: [
        {
          type: Route,
          id: 'index',
          component: Index,
          children: routes
        }
      ]
    },
    {
      type: Redirect,
      path: '/',
      to: Hooks.applyFilter('applicationRedirectRoute', '/dashboard')
    },
    {
      type: Route,
      path: '*',
      component: NotFoundPage
    }
  ];

  return routes;
}

function getRoutes() {
  // Get application routes
  let routes = getApplicationRoutes();
  // Provide opportunity for plugins to inject routes
  return Hooks.applyFilter('applicationRoutes', routes);
}

module.exports = {
  getRoutes
};
