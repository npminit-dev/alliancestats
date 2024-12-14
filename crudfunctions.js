import { db } from './db/dbscripts.js'
import { InteractionResponseType } from 'discord-interactions';

export function addCorp(res, data) {
  const options = data.options.reduce((acc, option) => {
    acc[option.name] = option.value;
    return acc;
  }, {});

  const {
    corpname,
    corplevel,
    corpbonus,
    fslevel,
    ws,
    rs,
    member_count,
    open_closed,
    event_score,
  } = options;

  try {
    // Insertar en la base de datos
    db.prepare(`
      INSERT INTO corporations (corpname, corplevel, corpbonus, fslevel, ws, rs, member_count, open_closed, event_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(corpname, corplevel, corpbonus, fslevel, ws ? 1 : 0, rs ? 1 : 0, member_count, open_closed, event_score);

    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `Corporation "${corpname}" added successfully! 🎉`,
      },
    });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT') {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `❌ A corporation with the name "${corpname}" already exists.`,
        },
      });
    }

    console.error('Error inserting corporation:', err);
    return res.status(500).send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `❌ An error occurred while adding the corporation.`,
      },
    });
  }
}