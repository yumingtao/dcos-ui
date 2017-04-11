import {Route} from 'react-router';

const dashboardRoutes = {
  category: 'root',
  type: Route,
  path: 'dashboard',
  getComponent(nextState, cb) {
    require.ensure([], (require) => {
      cb(null, require('../pages/DashboardPage'));
    });
  },
  isInSidebar: true
};

module.exports = dashboardRoutes;
