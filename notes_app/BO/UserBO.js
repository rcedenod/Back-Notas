const UserBO = class {
    constructor() {}
  
    async getUsers(params) {
      try {
        const result = await database.executeQuery("security", "getUsers", []);
        if (!result || !result.rows) {
          console.error("La consulta no devolvió resultados");
          return { sts: false, msg: "Error al obtener usuarios" };
        }

        const formattedRows = result.rows.map(user => ({
            ...user,
            birth_date: user.birth_date
              ? user.birth_date.toISOString().split("T")[0]
              : null
          }));

        return { sts: true, data: formattedRows };
      } catch (error) {
        console.error("Error en getUsers:", error);
        return { sts: false, msg: "Error al ejecutar la consulta" };
      }
    }
  

    async createUser(params) {
      try {
        // Validar que existan todos los datos obligatorios
        const { name, lastName, birthDate, email, password, userName} = params;
        
        if (!name || !lastName || !birthDate || !email || !password || !userName) {
          return { sts: false, msg: "Faltan datos obligatorios" };
        }
        console.log(params);
        
        
        // Insertar la persona en la tabla public.person
        const personResult = await database.executeQuery("public", "createPerson", [
          name,
          lastName,
          birthDate
        ]);
        if (!personResult || !personResult.rows || personResult.rows.length === 0) {
          console.error("No se pudo crear la persona");
          return { sts: false, msg: "No se pudo crear la persona" };
        }
        
        // Obtener el id_person generado
        const id_person = personResult.rows[0].id_person;
        console.log(`Persona creada con id_person: ${id_person}`);
        
        // Insertar el usuario en la tabla security.user
        const userResult = await database.executeQuery("security", "createUser", [
          email,
          password,
          userName,
          id_person
        ]);
        if (!(userResult && userResult.rowCount > 0)) {
          return { sts: false, msg: "No se pudo crear el usuario" };
        }
  
        // Obtener el id del usuario recién creado
        const id_user = userResult.rows[0].id_user;
  
        // Insertar en la tabla user_profile para asignar los perfiles al usuario
        let allInserted = true;
        for (let profileId of id_profile) {
          const userProfileResult = await database.executeQuery("security", "createUserProfile", [
            id_user,
            profileId
          ]);
          if (!(userProfileResult && userProfileResult.rowCount > 0)) {
            allInserted = false;
            console.error(`No se pudo asignar el perfil ${profileId} al usuario ${email}`);
          }
        }
        if (allInserted) {
          console.log(`El usuario: ${email} fue creado y asignado a los perfiles correctamente`);
          return { sts: true, msg: "Usuario creado correctamente" };
        } else {
          return { sts: false, msg: "Usuario creado, pero no se pudo asignar uno o más perfiles" };
        }
      } catch (error) {
        console.error("Error en createUser:", error);
        return { sts: false, msg: "Error al crear el usuario" };
      }
    }
  
    async updateUser(params) {
      try {
        // Se espera recibir los siguientes parámetros:
        const { id_user, id_person, name, lastName, email, password, username } = params;
        if (!id_user || !id_person || !name || !lastName || !email || !password || !username) {
          console.log("params: ", params);
          return { sts: false, msg: "Faltan datos obligatorios" };
        }
        
        // Actualizar la persona en la tabla public.person
        const personResult = await database.executeQuery("public", "updatePerson", [
          name,
          lastName,
          id_person
        ]);
        if (!personResult || personResult.rowCount === 0) {
          console.error("No se pudo actualizar la persona");
          return { sts: false, msg: "No se pudo actualizar la persona" };
        }
    
        // Actualizar el usuario en la tabla security.user
        const userResult = await database.executeQuery("security", "updateUser", [
          email,
          password,
          username,
          id_user
        ]);
        if (!userResult || userResult.rowCount === 0) {
          console.error("No se pudo actualizar el usuario");
          return { sts: false, msg: "No se pudo actualizar el usuario" };
        }
    
        return { sts: true, msg: "Usuario actualizado correctamente" };
      } catch (error) {
        console.error("Error en updateUser:", error);
        return { sts: false, msg: "Error al actualizar el usuario" };
      }
    }    
  
  async deleteUsers(params) {
    try {
      if (!params.ids || !Array.isArray(params.ids) || params.ids.length === 0) {
        return { sts: false, msg: "Faltan datos obligatorios" };
      }
      // params.ids es un arreglo de id_user a eliminar, ej: [22, 23, 45]

      // 1) Obtener id_person asociados (para luego eliminar de public.person)
      const userInfoResult = await database.executeQuery("security","getUserById",[params.ids]);
      if (!userInfoResult || !userInfoResult.rows || userInfoResult.rows.length === 0) {
        return { sts: false, msg: "No se encontraron los usuarios" };
      }
      // userInfoResult.rows es un array de objetos { id_user, fk_id_person }
      const idPersons = userInfoResult.rows.map(u => u.fk_id_person);

      // 2) Obtener todos los id_note que pertenecen a esos usuarios
      const notesResult = await database.executeQuery(
        "public",
        "getAllUserNotes",   // ya existe en tu JSON: SELECT ... WHERE pk_id_user = $1
        [params.ids]         // En getAllUserNotes se espera un solo $1, pero como $$1 es ANY($1::int[])
      );
      // Importante: getAllUserNotes debe definirse así para aceptar ARRAY:
      //   "getAllUserNotes": "SELECT id_note FROM notes WHERE fk_id_user = ANY($1::int[])"
      if (!notesResult || !notesResult.rows) {
        return { sts: false, msg: "Error al obtener notas de usuario" };
      }
      const noteIds = notesResult.rows.map(row => row.id_note);
      // si no hay notas, noteIds es []

      // 3) Borrar dependencias en favorites y category_note
      if (noteIds.length > 0) {
        // 3a) Eliminar de favorites donde fk_id_note está en noteIds
        await database.executeQuery(
          "public",
          "deleteFavoritesByNoteIds",
          [noteIds]
        );
        // 3b) Eliminar de category_note donde fk_id_note está en noteIds
        await database.executeQuery(
          "public",
          "deleteCategoryNoteByNoteIds",
          [noteIds]
        );
        // 3c) Borrar las notas en sí
        await database.executeQuery(
          "public",
          "deleteNotesByUserIds",
          [params.ids]
        );
        // Nota: deleteNotesByUserIds debe definirse como:
        //   DELETE FROM notes WHERE fk_id_user = ANY($1::int[])
      }

      // 4) Borrar relaciones de perfil y usuario
      await database.executeQuery("security", "deleteUserProfileByUserId", [
        params.ids
      ]);
      await database.executeQuery("security", "deleteUser", [params.ids]);

      // 5) Borrar persona(s) en public.person
      await database.executeQuery("public", "deletePerson", [idPersons]);

      return { sts: true, msg: "Usuarios y sus notas eliminados correctamente" };
    } catch (error) {
      console.error("Error en deleteUsers:", error);
      return { sts: false, msg: "Error al eliminar los usuarios y sus notas" };
    }
  }
};
  
  module.exports = UserBO;
  