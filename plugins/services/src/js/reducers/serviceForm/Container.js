import {SET} from '../../../../../../src/js/constants/TransactionTypes';
import VolumeConstants from '../../constants/VolumeConstants';

const {MESOS, DOCKER} = VolumeConstants.type;

const CONTAINER_TYPES_MAP = {
  docker: DOCKER,
  mesos: MESOS,
  universal: MESOS
};

function container(state = {}, {type, path, value}) {
  let joinedPath = path && path.join('.');
  let newState = Object.assign({}, state);
  if (!newState.type) {
    newState.type = 'mesos';
  }

  if (type === SET && joinedPath === 'container.type') {
    // Update stored container type
    newState.type = CONTAINER_TYPES_MAP[value];
  }

  if (type === SET && joinedPath === 'container.docker.privileged') {
    newState.docker = Object.assign({}, state.docker, {privileged: value});
  }

  if (type === SET && joinedPath === 'container.docker.forcePullImage') {
    newState.docker = Object.assign({}, state.docker, {forcePullImage: value});
  }

  if (type === SET && joinedPath === 'container.docker.image') {
    newState.docker = Object.assign({}, state.docker, {image: value});
  }

  // Move container to new containerKey
  return newState;
};

module.exports = {
  JSONReducer: container,
  FormReducer: container
};
