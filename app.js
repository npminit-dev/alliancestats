import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  verifyKeyMiddleware,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';
import { formatString } from './utils.js';
import { db } from './db/dbscripts.js'
import { addCorp, deleteCorp, editCorp } from './crudfunctions.js';
import { GET_STARTED } from './constants.js';

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */

let row = db.prepare('SELECT * FROM server_configs').all()

app.get('/', (_, res) => {
  return res.send('Alliance Stats responding :)')
})

app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
  // Interaction type and data
  const { type, data } = req.body;

  let row = db.prepare('SELECT * FROM server_configs').all()
  console.log(row)

  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    if(name === 'getstarted') {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: GET_STARTED
        }
      })
    }

    if (name === 'setadminrole') {
      const serverId = req.body.guild_id;
      const member = req.body.member;
      const options = data.options.reduce((acc, option) => {
        acc[option.name] = option.value;
        return acc;
      }, {});

      if (!member || !member.roles) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: '`⚠️ You need to be a member with roles to perform this action.`',
          },
        });
      }

      // Verificar si el usuario tiene permisos de administrador
      if (!(member.permissions & 0x8)) { // El permiso de administrador tiene el valor 0x8
        console.log('nope')
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: '`⚠️ You need to have administrator permissions to set the admin role.`',
          },
        });
      }

      const roleId = options['role_id'];

      try {
        db.prepare(`
        INSERT INTO server_configs (server_id, admin_role_id) VALUES (?, ?)
        ON CONFLICT(server_id) DO UPDATE SET admin_role_id = excluded.admin_role_id;
      `).run(serverId, roleId);
        console.log('Admin role set successfully.');
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: '`✔️ Admin role added successfully`'
          }
        })
      } catch (error) {
        console.error('Error setting admin role:', error);
      }
    }

    async function checkAdminRole(req, res, next) {
      const serverId = req.body.guild_id;

      // Consulta el rol de administrador configurado en la base de datos
      const row = db.prepare('SELECT admin_role_id FROM server_configs WHERE server_id = ?').get(serverId);

      if (!row) {
        // Si no hay un rol configurado, devuelve un error
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: '`⚠️ Admin role has not been set for this server.`',
          },
        });
      }

      const requiredRoleId = row.admin_role_id;

      // Verifica si el usuario tiene el rol adecuado
      const member = req.body.member;
      if (!member || !member.roles || !member.roles.includes(requiredRoleId)) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: '`⛔ You do not have permission to perform this action.`',
          },
        });
      }
      // Si todo está correcto, llama a la siguiente función
      next();
    }

    if (name === 'listcorps') {
      try {
        const options = data.options || [];
        const sortBy = options.find(opt => opt.name === 'sort_by')?.value || 'corpbonus';
        const order = options.find(opt => opt.name === 'order')?.value || 'desc';
        const filter = options.find(opt => opt.name === 'filter')?.value;

        const validColumns = ['corplevel', 'corpbonus', 'fslevel', 'event_score', 'member_count'];
        if (!validColumns.includes(sortBy)) {
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: '`🤔 Invalid sort_by parameter. Valid options: corplevel, corpbonus, fslevel, event_score, member_count.`',
            },
          });
        }

        let filterCondition = '';
        if (filter) {
          if (filter.startsWith('ws')) {
            filterCondition = `WHERE ws = ${filter === 'ws_true' ? 1 : 0}`;
          } else if (filter.startsWith('rs')) {
            filterCondition = `WHERE rs = ${filter === 'rs_true' ? 1 : 0}`;
          } else if (filter.startsWith('open_closed')) {
            const status = filter.split('_')[2];
            filterCondition = `WHERE open_closed = '${status}'`;
          }
        }

        const query = `SELECT * FROM corporations ${filterCondition} ORDER BY ${sortBy} ${order.toUpperCase()}`;
        const corporations = db.prepare(query).all();

        const formattedList = corporations.map(
          corp =>
            `- ${formatString(corp.corpname,16)} - ${formatString(corp.corplevel,3)} - ${formatString(corp.corpbonus + '%',5)} - ${formatString(corp.fslevel, 2)} - ${formatString(corp.ws ? 'Ys' : 'No', 2)} - ${formatString(corp.rs ? 'Ys' : 'No', 2)} - ${formatString('  ' + corp.member_count, 7)} - ${formatString(corp.open_closed === 'open' ? 'Yes' : 'No', 4)} - ${formatString(corp.event_score, 8)} -`
        );

        formattedList.unshift('-----------------------------------------------------------------------------')
        formattedList.unshift('- Corporation name - Lvl - Bonus - FS - WS - RS - Members - Open - EvtScore -')
        formattedList.unshift('-----------------------------------------------------------------------------')
        formattedList.unshift('```---------------------------------------------------------------------------')

        const content = formattedList.length > 0
          ? formattedList.join('\n').concat('\n-----------------------------------------------------------------------------```')
          : '```- No corporations found with the given criteria. -```';
        

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: content,
          },
        });
      } catch (error) {
        console.error('Error fetching corporations:', error);
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: '`💥 An error occurred while fetching corporations. Please try again later.`',
          },
        });
      }
    }

    if (['addcorp', 'editcorp', 'deletecorp'].includes(name)) {
      // Verificar permisos del rol
      return checkAdminRole(req, res, () => {
        // Manejar cada comando según el nombre
        console.log('Command authorized:', name);
        if (name === 'addcorp') {
          // Extraer los parámetros enviados con el comando
          addCorp(res, data)
        }

        // Aquí podrías agregar lógica similar para otros comandos (editcorp, deletecorp)
        if(name === 'editcorp') {
          editCorp(res, data)
        }

        if (name === 'deletecorp') {
          deleteCorp(res, data)
        }
      });
    }


    console.error(`unknown command: ${name}`);
    return res.json({ error: 'unknown command' });
  }

  console.error('unknown interaction type', type);
  return res.json({ error: 'unknown interaction type' });
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
