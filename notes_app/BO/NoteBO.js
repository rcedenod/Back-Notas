const dayjs = require('dayjs');

const NoteBO = class {

    constructor() {}
    
    async getNotes(params){
        try {
            const result = await database.executeQuery("public", "getNotes", []);
        
            if (!result || !result.rows) {
              console.error("La consulta no devolvio resultados");
              return { sts: false, msg: "Error al obtener notas" };
            }
        
            return { sts: true, data: result.rows };
          } catch (error) {
            console.error("Error en getNotes:", error);
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
          return { sts: true, msg: "Nota creada correctamente" };
        } else {
          return { sts: false, msg: "No se pudo crear la nota" };
        }
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