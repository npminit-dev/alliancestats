import { db } from './db/dbscripts.js'
import { InteractionResponseType } from 'discord-interactions';

export function addCorp(res, data) {
  const options = data.options.reduce((acc, option) => {
    acc[option.name] = option.value;
    return acc;
  }, {});

  const {
    corp_name,
    corp_level,
    corp_bonus,
    fs_level,
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
    `).run(corp_name, corp_level, corp_bonus, fs_level, ws ? 1 : 0, rs ? 1 : 0, member_count, open_closed, event_score);

    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: '`Corporation "' + corp_name + '" added successfully! 🚀`',
      },
    });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT') {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '`✋🏼 A corporation with the name "' + corp_name + '" already exists.`',
        },
      });
    }

    console.error('Error inserting corporation:', err);
    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: '`💥 An error occurred while adding the corporation.`',
      },
    });
  }
}

export function editCorp(res, data) {
    const options = data.options.reduce((acc, option) => {
      acc[option.name] = option.value;
      return acc;
    }, {});

    const corpname = options.corp_to_edit;

    if (!corpname) {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '`🤔 You must specify the corporation name to edit.`',
        },
      });
    }

    // Obtener la corporación de la base de datos
    const corp = db.prepare('SELECT * FROM corporations WHERE corpname = ?').get(corpname);

    if (!corp) {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '`🔍❌ No corporation found with the name "' +  corpname + '".`',
        },
      });
    }

    // Los valores de la corporación a editar
    const {
      corplevel,
      corpbonus,
      fslevel,
      ws,
      rs,
      open_closed,
      event_score,
      member_count
    } = corp;

    // Verifica si el usuario proporcionó nuevos valores
    const updatedCorp = {
      corplevel: options.level ?? corplevel,
      corpbonus: options.bonus ?? corpbonus,
      fslevel: options.fs_level ?? fslevel,
      ws: options.ws !== undefined ? options.ws : ws,
      rs: options.rs !== undefined ? options.rs : rs,
      open_closed: options.open_closed ?? open_closed,
      event_score: options.event_score ?? event_score,
      new_corp_name: options.new_corp_name ?? corpname,
      member_count: options.member_count ?? member_count
    };

    // Actualizar la base de datos
    try {
      db.prepare(`
      UPDATE corporations
      SET corpname = ?, corplevel = ?, corpbonus = ?, fslevel = ?, ws = ?, rs = ?, member_count = ?, open_closed = ?, event_score = ?
      WHERE corpname = ?
    `).run(
        updatedCorp.new_corp_name,
        updatedCorp.corplevel,
        updatedCorp.corpbonus,
        updatedCorp.fslevel,
        updatedCorp.ws ? 1 : 0,
        updatedCorp.rs ? 1 : 0,
        updatedCorp.member_count,
        updatedCorp.open_closed,
        updatedCorp.event_score,
        corpname
      );

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '`Corporation "' + corpname + '" updated successfully 👨🏽‍🚀`',
        },
      });
    } catch (err) {
      console.error('Error updating corporation:', err);
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '`💥 An error occurred while updating the corporation.`',
        },
      });
    }
  }

export function deleteCorp(res, data) {
  const corpname = data.options.find(opt => opt.name === 'corp_name')?.value;

  if (!corpname) {
    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: '`🤔 You must specify a corporation name to delete.`',
      },
    });
  }

  // Verificar si la corporación existe en la base de datos
  const corp = db.prepare('SELECT * FROM corporations WHERE corpname = ?').get(corpname);

  if (!corp) {
    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: '`🔍❌ No corporation found with the name "' + corpname + '".`',
      },
    });
  }

  // Eliminar la corporación de la base de datos
  try {
    db.prepare('DELETE FROM corporations WHERE corpname = ?').run(corpname);

    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: '`Corporation "' + corpname +  '" deleted successfully! 👨‍🚀`',
      },
    });
  } catch (err) {
    console.error('Error deleting corporation:', err);
    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: '`💥 An error occurred while deleting the corporation.`',
      },
    });
  }
}
