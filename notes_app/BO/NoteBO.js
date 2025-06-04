const dayjs = require('dayjs');

const NoteBO = class {

    constructor() {}
    
    async getAllUserNotes(params){
        try {
            const result = await database.executeQuery("public", "getAllUserNotes", [
              ss.sessionObject.userId
            ]);
        
            if (!result || !result.rows) {
              console.error("La consulta no devolvio resultados");
              return { sts: false, msg: "Error al obtener notas del usuario" };
            }
      
            return { sts: true, data: result.rows };

          } catch (error) {
            console.error("Error en getAllUserNotes:", error);
            return { sts: false, msg: "Error al ejecutar la consulta" };
          }
    }

    async getFavUserNotes(params){
        try {
            const result = await database.executeQuery("public", "getFavUserNotes", [
              ss.sessionObject.userId
            ]);
        
            if (!result || !result.rows) {
              console.error("La consulta no devolvio resultados");
              return { sts: false, msg: "Error al obtener notas favoritas del usuario" };
            }
      
            return { sts: true, data: result.rows };

          } catch (error) {
            console.error("Error en getFavUserNotes:", error);
            return { sts: false, msg: "Error al ejecutar la consulta" };
          }
    }

    async getNotesByFolder(params){
        try {
            const result = await database.executeQuery("public", "getNotesByFolder", [
              params.folderId
            ]);
        
            if (!result || !result.rows) {
              console.error("La consulta no devolvio resultados");
              return { sts: false, msg: "Error al obtener notas por categoria" };
            }
        
            return { sts: true, data: result.rows };
          } catch (error) {
            console.error("Error en getNotesByFolder:", error);
            return { sts: false, msg: "Error al ejecutar la consulta" };
          }
    }
  
    async createNote(params) {
      try {
          const result = await database.executeQuery("public", "createNote", [
              params.title,
              params.description,
              dayjs().format('YYYY-MM-DD'),
              params.privacy,
              ss.sessionObject.userId
          ]);

          if (result && result.rowCount > 0) {
            console.log("Nota insertada");
          } else {
            return { sts: false, msg: "No se pudo crear la nota" };
          }

          const id_note = result.rows[0].id_note;

        if (params.folderId != 0){
          const resultCategory = await database.executeQuery("public", "assignNoteFolder", [
            id_note,
            params.folderId
          ])

          if (resultCategory && resultCategory.rowCount > 0) {
            console.log( "Categoria asignada correctamente");
          } else {
            return { sts: false, msg: "No se pudo asignar la categoria" };
          }
        } 

        return { sts: true, msg: "Nota creada correctamente" };
        
      } catch (error) {
        console.error("Error en createNote:", error);
        return { sts: false, msg: "Error al crear la nota" };
      }
    }

    async updateNote(params) {
      try {
        const result = await database.executeQuery("public", "updateNote", [
          params.id_note, 
          params.title, 
          params.description,
          params.id_state,
        ]);
        if (result && result.rowCount > 0) {
          return { sts: true, msg: "Nota actualizada correctamente" };
        } else {
          return { sts: false, msg: "No se pudo actualizar las notas" };
        }
      } catch (error) {
        console.error("Error en updateNote:", error);
        return { sts: false, msg: "Error al actualizar las notas" };
      }
    }

    async deleteNotes(params) {
      try {
        const result = await database.executeQuery("public", "deleteNotes", [params.ids]);
        if (result && result.rowCount > 0) {
          return { sts: true, msg: "Notas eliminadas correctamente" };
        } else {
          return { sts: false, msg: "No se pudo eliminar las notas" };
        }
      } catch (error) {
        console.error("Error en deleteNotes:", error);
        return { sts: false, msg: "Error al eliminar las notas" };
      }
    }
}

module.exports = NoteBO;