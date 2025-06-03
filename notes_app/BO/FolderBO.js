const FolderBO = class {

    constructor() {}
    
    async getUserFolders(params){
        try {
            const result = await database.executeQuery("public", "getUserFolders", [
              ss.sessionObject.userId
            ]);
        
            if (!result || !result.rows) {
              console.error("La consulta no devolvio resultados");
              return { sts: false, msg: "Error al obtener carpetas del usuario" };
            }
        
            return { sts: true, data: result.rows };
            
          } catch (error) {
            console.error("Error en getCategories:", error);
            return { sts: false, msg: "Error al ejecutar la consulta" };
          }
    }
  
    async createFolder(params) {
      try {
        const result = await database.executeQuery("public", "createFolder", [
          params.folderName,
          ss.sessionObject.userId
        ]);
        if (result && result.rowCount > 0) {
          return { sts: true, msg: "  Carpeta creada correctamente" };
        } else {
          return { sts: false, msg: "No se pudo crear la carpeta" };
        }
      } catch (error) {
        console.error("Error en createFolder:", error);
        return { sts: false, msg: "Error al crear la carpeta" };
      }
    }

    async updateCategory(params) {
      try {
        const result = await database.executeQuery("public", "updateCategory", [
          params.id_category, 
          params.categoryName
        ]);
        if (result && result.rowCount > 0) {
          return { sts: true, msg: "carpeta actualizada correctamente" };
        } else {
          return { sts: false, msg: "No se pudo actualizar las carpetas" };
        }
      } catch (error) {
        console.error("Error en updateCategory:", error);
        return { sts: false, msg: "Error al actualizar las carpetas" };
      }
    }

    async deleteCategories(params) {
      try {
        const result = await database.executeQuery("public", "deleteCategories", [params.ids]);
        if (result && result.rowCount > 0) {
          return { sts: true, msg: "carpetas eliminadas correctamente" };
        } else {
          return { sts: false, msg: "No se pudo eliminar las carpetas" };
        }
      } catch (error) {
        console.error("Error en deleteCategories:", error);
        return { sts: false, msg: "Error al eliminar las carpetas" };
      }
    }
}

module.exports = FolderBO;