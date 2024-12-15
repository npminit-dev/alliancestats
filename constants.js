export const GET_STARTED = `
🌌🌌🌌🌌  **__ALLIANCE STATS__**  🌌🌌🌌🌌

**__Get started__**

Once **AllianceStats** is installed, any member can see the list of corporations.
To access the add/delete/edit operations, you must create a new custom role and assign it to the bot, 
and then assign that role to the users who must obtain access to those operations.

To achieve this:

**1**.  A user with permissions to create roles must create a new custom role.
**2**.  Get the ID of the newly created role. You can obtain the custom **role ID** by activating **Discord development mode**, this is done by going to *User Settings > Advanced > Development mode: on*, then go to *server setup > roles > right click on the role > **copy role ID***
**3**.  The owner of the server, or a user with administrator permissions, must register a new role on the server using the command */setadminrole + **the_numeric_role_id***
**4**.  If everything goes well, users assigned the new role will be able to add, edit and delete corporations from the list.

**__Available commands__**

  **/getstarted**: shows this instructions
  **/setadminrole**: sets the admin role to let users to acces to restricted operations
  **/listcorps**: list the corporations
  **/addcorp**: add new corp
  **/editcorp**: edit a corp
  **/deletecorp**: delete a corp

Each command has multiple parameters that has their own descriptions in the Discord UI.
Press **TAB**, **↑** and **↓** arrows to navigate between parameters and autocomplete options.

And thats' all! 🪐🌠
`