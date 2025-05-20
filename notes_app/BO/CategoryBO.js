const CategoryBO = class {

    constructor() {}
    
    async getCategories(params){
        try {
            const result = await database.executeQuery("public", "getCategories", []);
        
            if (!result || !result.rows) {
              console.error("La consulta no devolvio resultados");
              return { sts: false, msg: "Error al obtener categorias" };
            }
        
            return { sts: true, data: result.rows };
          } catch (error) {
            console.error("Error en getCategories:", error);
            return { sts: false, msg: "Error al ejecutar la consulta" };
          }
    }
  
    async createCategory(params) {
      try {
        const result = await database.executeQuery("public", "createCategory", [params.categoryName]);
        if (result && result.rowCount > 0) {
          return { sts: true, msg: "Categoria creada correctamente" };
        } else {
          return { sts: false, msg: "No se pudo crear la categoria" };
        }
      } catch (error) {
        console.error("Error en createCategory:", error);
        return { sts: false, msg: "Error al crear la categoria" };
      }
    }

    async updateCategory(params) {
      try {
        const result = await database.executeQuery("public", "updateCategory", [
          params.id_category, 
          params.categoryName
        ]);
        if (result && result.rowCount > 0) {
          return { sts: true, msg: "Categoria actualizada correctamente" };
        } else {
          return { sts: false, msg: "No se pudo actualizar las categorias" };
        }
      } catch (error) {
        console.error("Error en updateCategory:", error);
        return { sts: false, msg: "Error al actualizar las categorias" };
      }
    }

    async deleteCategories(params) {
      try {
        const result = await database.executeQuery("public", "deleteCategories", [params.ids]);
        if (result && result.rowCount > 0) {
          return { sts: true, msg: "Categorias eliminadas correctamente" };
        } else {
          return { sts: false, msg: "No se pudo eliminar las categorias" };
        }
      } catch (error) {
        console.error("Error en deleteCategories:", error);
        return { sts: false, msg: "Error al eliminar las categorias" };
      }
    }
}

module.exports = CategoryBO;