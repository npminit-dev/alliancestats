import 'dotenv/config';
import { capitalize, InstallGlobalCommands } from './utils.js';

const SET_ADMIN_ROLE_COMMAND = {
  name: 'setadminrole',
  description: 'Set the role that has admin privileges',
  options: [
    {
      name: 'role_id',
      description: 'The ID of the role with admin privileges',
      type: 3, // Tipo de opción: String (ID de rol)
      required: true,
    },
  ],
};

const GET_STARTED = {
  name: 'getstarted',
  description: 'Shows the bot installation instructions and commands info'
}

const LIST_CORPS_COMMAND = {
  name: 'listcorps',
  description: 'Get the list of all corporations',
  type: 1, // Chat input command
  options: [
    {
      name: 'sort_by',
      description: 'Sort corporations by a field (e.g., bonus, level)',
      type: 3, // STRING
      required: false,
      choices: [
        { name: 'Bonus', value: 'corpbonus' },
        { name: 'Level', value: 'corplevel' },
        { name: 'FS Level', value: 'fslevel' },
        { name: 'Event score', value: 'event_score' },
        { name: 'Member count', value: 'member_count' }
      ],
    },
    {
      name: 'order',
      description: 'Order of sorting (asc or desc)',
      type: 3, // STRING
      required: false,
      choices: [
        { name: 'Ascending', value: 'asc' },
        { name: 'Descending', value: 'desc' },
      ],
    },
    {
      name: 'filter',
      description: 'Filter corporations by field (e.g., ws, rs, open_closed)',
      type: 3, // STRING
      required: false,
      choices: [
        { name: 'WS (true)', value: 'ws_true' },
        { name: 'WS (false)', value: 'ws_false' },
        { name: 'RS (true)', value: 'rs_true' },
        { name: 'RS (false)', value: 'rs_false' },
        { name: 'Open', value: 'open_closed_open' },
        { name: 'Closed', value: 'open_closed_closed' },
      ],
    },
  ],
};

const ADD_CORP_COMMAND = {
  name: 'addcorp',
  description: 'Add a new corporation to the list',
  options: [
    {
      name: 'corp_name',
      description: 'Name of the corporation (must be unique)',
      type: 3, // STRING
      required: true,
    },
    {
      name: 'corp_level',
      description: 'Level of the corporation (1-21)',
      type: 4, // INTEGER
      required: true,
    },
    {
      name: 'corp_bonus',
      description: 'Bonus percentage (0-1000)',
      type: 4, // INTEGER
      required: true,
    },
    {
      name: 'fs_level',
      description: 'FS level (1-20)',
      type: 4, // INTEGER
      required: true,
    },
    {
      name: 'ws',
      description: 'Participates in White Star? (true/false)',
      type: 5, // BOOLEAN
      required: true,
    },
    {
      name: 'rs',
      description: 'Participates in Red Star? (true/false)',
      type: 5, // BOOLEAN
      required: true,
    },
    {
      name: 'member_count',
      description: 'Number of members (0-40)',
      type: 4, // INTEGER
      required: true,
    },
    {
      name: 'open_closed',
      description: 'Is the corporation open or closed?',
      type: 3, // STRING
      required: true,
      choices: [
        { name: 'Open', value: 'open' },
        { name: 'Closed', value: 'closed' },
      ],
    },
    {
      name: 'event_score',
      description: 'Event score of the corporation',
      type: 4, // INTEGER
      required: true,
    },
  ],
};

const DELETE_CORP_COMMAND = {
  name: 'deletecorp',
  description: 'Delete a corporation by name',
  type: 1,
  options: [
    {
      name: 'corp_name',
      description: 'The name of the corporation to delete',
      type: 3, // Tipo 3 es para strings
      required: true,
    },
  ],
};

const EDIT_CORP_COMMAND = {
  name: 'editcorp',
  description: 'Edit an existing corporation by name',
  type: 1,
  options: [
    {
      name: 'corp_to_edit',
      description: 'The name of the corporation to edit',
      type: 3, // Tipo 3 es para strings
      required: true,
    },
    {
      name: 'level',
      description: 'The new level of the corporation (1-21)',
      type: 4, // Tipo 4 es para enteros
      required: false,
    },
    {
      name: 'bonus',
      description: 'The new bonus of the corporation (0-1000)',
      type: 4, // Tipo 4 es para enteros
      required: false,
    },
    {
      name: 'fs_level',
      description: 'The new FS level of the corporation (1-20)',
      type: 4, // Tipo 4 es para enteros
      required: false,
    },
    {
      name: 'ws',
      description: 'Set WS status (true/false)',
      type: 5, // Tipo 5 es para booleano
      required: false,
    },
    {
      name: 'rs',
      description: 'Set RS status (true/false)',
      type: 5, // Tipo 5 es para booleano
      required: false,
    },
    {
      name: 'member_count',
      description: 'Set the corp members count (0-40)',
      type: 4,
      required: false
    },
    {
      name: 'open_closed',
      description: 'Set open/closed status',
      type: 3, // Tipo 3 es para strings
      required: false,
      choices: [
        { name: 'Open', value: 'open' },
        { name: 'Closed', value: 'closed' },
      ],
    },
    {
      name: 'event_score',
      description: 'Set the corp event score',
      type: 4,
      required: false,
    },
    {
      name: 'new_corp_name',
      description: 'The new name for the corporation',
      type: 3,
      required: false
    }
  ],
};

const ALL_COMMANDS = [
  GET_STARTED,
  SET_ADMIN_ROLE_COMMAND, 
  LIST_CORPS_COMMAND, 
  ADD_CORP_COMMAND,
  DELETE_CORP_COMMAND,
  EDIT_CORP_COMMAND
];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
