import { v4 as uuidv4 } from 'uuid';
import { Entries } from '@/objects/common';

export type Identity = {
  uuid: string;
  name: string;
  isLocked: boolean;
  isSquire: boolean;
  isCaptain: boolean;
  isFullFlex: boolean;
};

export type ClassType = {
  rank: number;
  registrationRank: number;
  highestSeenRank: number;
  manualRank: number;
  needsCheck: boolean;
  rankNote: string;

  priority: number;
  isActive: boolean;
  primary: boolean;
  secondary: boolean;

  playHours?: number;
};

export type DescribedClassType = ClassType & { role: string };

export type Classes = {
  dps: ClassType;
  tank: ClassType;
  support: ClassType;
};

export type Stats = {
  classes: Classes;
};

export type Player = {
  identity: Identity;
  stats: Stats;
  createdAt: Date;
};

export type Players = {
  [tag: string]: Player;
};

export type LobbyType = 'players' | 'backup';

export type PlayerEntries = Entries<Players>;

export type ReservedPlayers = string[];

const createDefaultClass = (priority: number): ClassType => ({
  rank: 0,
  registrationRank: 0,
  highestSeenRank: 0,
  manualRank: 0,
  needsCheck: false,
  rankNote: '',

  playHours: 0,
  priority,
  primary: false,
  isActive: false,
  secondary: false,
});

const createDefaultPlayer: (name: string) => Player = name => {
  return {
    identity: {
      name,
      uuid: uuidv4(),
      isLocked: false,
      isCaptain: false,
      isSquire: false,
      isFullFlex: false,
    },
    stats: {
      classes: {
        dps: createDefaultClass(0),
        tank: createDefaultClass(1),
        support: createDefaultClass(2),
      },
    },
    createdAt: new Date(),
  };
};

const getRole = (roles: Classes, role: string): ClassType => {
  if (role === 'dps') {
    return roles.dps;
  }

  if (role === 'tank') {
    return roles.tank;
  }

  return roles.support;
};

const getBalanceRank = (role: ClassType): number => {
  const currentRank = role.rank || 0;
  const registrationRank = role.registrationRank || 0;
  const manualRank = role.manualRank || 0;
  const highestSeenRank = role.highestSeenRank || 0;

  const smartHighestRank = highestSeenRank > 0 ? highestSeenRank - 200 : 0;

  return Math.max(
    currentRank,
    registrationRank,
    manualRank,
    smartHighestRank
  );
};

const getTopRole = (player: Player): ClassType => {
  return Object.values(player.stats.classes)
    .filter(role => role.isActive)
    .sort((a, b) => a.priority - b.priority)[0];
};

const getTopRoleName = (player: Player): string => {
  return Object.entries(player.stats.classes)
    .filter(([, role]) => role.isActive)
    .sort(([, a], [, b]) => a.priority - b.priority)[0][0];
};

const getTopRank = (player: Player): number => {
  const topRole = getTopRole(player);
  return topRole ? getBalanceRank(topRole) : 0;
};

export default {
  getRole,
  getTopRank,
  getTopRole,
  getTopRoleName,
  getBalanceRank,
  createDefaultPlayer,
};