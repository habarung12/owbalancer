import { computed, ref } from 'vue';

export type Language = 'en' | 'ru';

export const language = ref<Language>(
  (localStorage.getItem('language') as Language) || 'en'
);

export const toggleLanguage = () => {
  language.value = language.value === 'ru' ? 'en' : 'ru';
  localStorage.setItem('language', language.value);
};

const dictionary = {
  en: {
    title: 'Tournament Balancer',
    createdBy: 'Created by',
    modifiedBy: 'Modified by',

    lobby: 'Lobby',
    teams: 'Teams',

    addPlayer: 'Add Player',
    playerPlaceholder: 'Name#1337',

    new: 'New',
    balance: 'Balance',
    clear: 'Clear',
    empty: 'Empty',
    chooseBalance: 'Choose balance',

    export: 'Export',
    text: 'Text',
    captains: 'Captains',
    import: 'Import',

    total: 'Total',
    visible: 'Seen',

    close: 'Close',
    saveChanges: 'Save changes',

    identity: 'Identity',
    stats: 'Stats',
    name: 'Name',
    captain: 'Captain',
    fullFlex: 'Full flex',
    locked: 'Is Locked',

    tournamentPreset: 'Tournament Preset',
    casual: 'Casual',
    tournament: 'Tournament',
    competitive: 'Competitive',
    advancedOptions: 'Advanced options',

    lowRankLimiter: 'Low rank limiter',
    secondaryRoles: 'Disallow duplicate secondary roles',
    dispersion: 'Enable role dispersion minimizer',

    casualDesc: 'Fast balance for regular custom games.',
    tournamentDesc: 'Recommended preset for tournaments.',
    competitiveDesc: 'Strictest balance for serious matches.',

    balanceType: 'Balance Type',
    full: 'Full',
    half: 'Half',
    final: 'Final',
  },

  ru: {
    title: 'Балансировщик турнира',
    createdBy: 'Создано',
    modifiedBy: 'Изменено',

    lobby: 'Лобби',
    teams: 'Команды',

    addPlayer: 'Добавить игрока',
    playerPlaceholder: 'Ник игрока',

    new: 'Новая',
    balance: 'Баланс',
    clear: 'Очистить',
    empty: 'Пустые',
    chooseBalance: 'Выбрать баланс',

    export: 'Экспорт',
    text: 'Текст',
    captains: 'Капитаны',
    import: 'Импорт',

    total: 'Всего',
    visible: 'Показано',

    close: 'Закрыть',
    saveChanges: 'Сохранить',

    identity: 'Данные',
    stats: 'Ранги',
    name: 'Имя',
    captain: 'Капитан',
    fullFlex: 'Фулл-флекс',
    locked: 'Заблокирован',

    tournamentPreset: 'Режим баланса',
    casual: 'Обычный',
    tournament: 'Турнир',
    competitive: 'Соревновательный',
    advancedOptions: 'Доп. настройки',

    lowRankLimiter: 'Ограничение низких рангов',
    secondaryRoles: 'Запрет вторичных ролей',
    dispersion: 'Баланс ролей',

    casualDesc: 'Быстрый баланс для обычных игр.',
    tournamentDesc: 'Рекомендуется для турниров.',
    competitiveDesc: 'Максимально строгий баланс.',

    balanceType: 'Тип баланса',
    full: 'Полный',
    half: 'Частичный',
    final: 'Финальный',
  },
};

export const t = computed(() => dictionary[language.value]);