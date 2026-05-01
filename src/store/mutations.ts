import { MutationTree } from 'vuex';

import cloneDeep from 'lodash/cloneDeep';

import { PLAYERS_IN_TEAM } from '@/constants';
import PObj, { Player, Stats, Players, ClassType, LobbyType } from '@/objects/player';
import TObj, { Teams, Team } from '@/objects/team';
import { BalancerOptions, Results } from '@/objects/balance';
import { ArchiveEntry } from '@/objects/archive';

import MutationTypes from './mutation-types';
import { State } from './state';

export type Mutations<S = State> = {
  [MutationTypes.CLEAR_TEAMS](state: S, _: undefined): void;
  [MutationTypes.EMPTY_TEAMS](state: S, _: undefined): void;
  [MutationTypes.EMPTY_NO_RANK](state: S, _: undefined): void;
  [MutationTypes.TOGGLE_BACKUP](state: S, _: undefined): void;
  [MutationTypes.TOGGLE_ARCHIVE](state: S, _: undefined): void;
  [MutationTypes.TOGGLE_BALANCE](state: S, _: undefined): void;
  [MutationTypes.SAVE_TO_ARCHIVE](state: S, _: undefined): void;
  [MutationTypes.TOGGLE_SELECTION](state: S, _: undefined): void;
  [MutationTypes.TOGGLE_BALANCER_SR](state: S, _: undefined): void;
  [MutationTypes.CLEAR_SQUIRES](state: S, _: undefined): void;
  [MutationTypes.CLEAR_CAPTAINS](state: S, _: undefined): void;
  [MutationTypes.DELETE_PLAYERS](state: S, lobby?: LobbyType): void;
  [MutationTypes.CLEAR_ALL_EXTRA](state: S, _: undefined): void;
  [MutationTypes.CLEAR_EDIT_PLAYER](state: S, _: undefined): void;
  [MutationTypes.ADD_TEAM](state: S, team: Team): void;
  [MutationTypes.ADD_TEAMS](state: S, teams: Teams): void;
  [MutationTypes.ADD_RESERVE](state: S, uuid: string): void;
  [MutationTypes.ADD_PLAYER](state: S, data: { player: Player; lobby?: LobbyType }): void;
  [MutationTypes.SELECT_PLAYERS](state: S, data: { playerIds: string[]; lobby: LobbyType }): void;
  [MutationTypes.SELECT_ARCHIVE](state: S, id: number): void;
  [MutationTypes.REMOVE_TEAM](state: S, teamUuid: string): void;
  [MutationTypes.EDIT_PLAYER](state: S, data: { playerId: string; lobby?: LobbyType }): void;
  [MutationTypes.ASSIGN_SQUIRES](state: S, maxSR: number): void;
  [MutationTypes.ADD_PLAYERS](state: S, data: { players: Players; lobby?: LobbyType }): void;
  [MutationTypes.ASSIGN_CAPTAINS](state: S, minSR: number): void;
  [MutationTypes.REMOVE_FROM_ARCHIVE](state: S, id: number): void;
  [MutationTypes.DELETE_PLAYER](state: S, data: { playerId: string; lobby?: LobbyType }): void;
  [MutationTypes.SET_RESULTS](state: S, results: Results): void;
  [MutationTypes.IMPORT_PLAYERS](state: S, data: { players: Players; lobby?: LobbyType }): void;
  [MutationTypes.IMPORT_ARCHIVE](state: S, data: ArchiveEntry): void;
  [MutationTypes.IMPORT_PLAYERS_OLD](state: S, data: string): void;
  [MutationTypes.RESERVE_PLAYERS](state: S, players: string[]): void;
  [MutationTypes.REMOVE_FROM_RESERVE](state: S, playerId: string): void;
  [MutationTypes.SET_BALANCER_OPTIONS](state: S, options: BalancerOptions): void;
  [MutationTypes.UPDATE_STATS](state: S, update: { uuid: string; stats: Stats; lobby?: LobbyType }): void;
  [MutationTypes.UPDATE_ARCHIVE_NAME](state: S, update: { id: number; name: string }): void;
  [MutationTypes.REMOVE_FROM_TEAM](state: S, data: { teamUuid: string; playerId: string }): void;
  [MutationTypes.UPDATE_TEAM_NAME](state: S, data: { teamUuid: string; teamName: string }): void;
  [MutationTypes.EDIT_RANK](
    state: S,
    data: { uuid: string; rank: number; role: 'dps' | 'support' | 'tank' }
  ): void;
  [MutationTypes.EDIT_SPECIALIZATION](
    state: S,
    data: {
      uuid: string;
      value: boolean;
      specialization: 'primary' | 'secondary';
      role: 'dps' | 'support' | 'tank';
    }
  ): void;
  [MutationTypes.ADD_TEAMPLAYER](
    state: S,
    data: {
      teamUuid: string;
      playerName: string;
      playerId: string;
      role: ClassType;
      primary: boolean;
      secondary: boolean;
      roleName: 'dps' | 'support' | 'tank';
    }
  ): void;
};

export const mutations: MutationTree<State> & Mutations = {
  [MutationTypes.SET_RESULTS](state, results) {
    state.balancerResults = results;
  },

  [MutationTypes.ADD_PLAYER](state, { player, lobby = 'players' }) {
    state[lobby][player.identity.uuid] = player;

    if (lobby === 'players' && state.teams.length > 0) {
      if (!state.reservedPlayers.includes(player.identity.uuid)) {
        state.reservedPlayers.push(player.identity.uuid);
      }
    }
  },
};