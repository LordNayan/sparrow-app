 /**
   * Function to extract root-level queries and their nested fields from the formatted schema JSON.
   */
 const extractRootQueries = (formattedSchemaJSON) => {
    // Find the root Query type
    const rootQuery = Object.entries(formattedSchemaJSON).find(
      ([key, value]) =>
        key === "Query" && value?.kind === "OBJECT",
    );

    if (!rootQuery) {
      console.error("Root Query type not found in the schema.");
      return {};
    }

    const rootQueryFields = rootQuery[1]?.fields || {};

    // Track visited types to prevent infinite recursion
    const visited = new Set();

    /**
     * Recursive function to extract nested fields.
     */
    const extractFields = (fieldType) => {
      // Avoid infinite recursion for circular references
      if (visited.has(fieldType)) {
        return {}; // Skip if already visited
      }
      visited.add(fieldType);

      const fieldTypeData = formattedSchemaJSON[fieldType];
      if (!fieldTypeData || fieldTypeData.kind !== "OBJECT") {
        return {};
      }

      const nestedFields = {};
      Object.entries(fieldTypeData.fields || {}).forEach(
        ([fieldName, fieldData]) => {
          if (
            fieldData.returnType &&
            formattedSchemaJSON[fieldData.returnType]?.fields
          ) {
            nestedFields[fieldName] = {
              ...fieldData,
              fields: extractFields(fieldData.returnType),
            };
          } else {
            nestedFields[fieldName] = fieldData;
          }
        },
      );

      return nestedFields;
    };

    const queries = {};
    Object.entries(rootQueryFields).forEach(
      ([queryName, queryData]) => {
        queries[queryName] = {
          ...queryData,
          fields: queryData.returnType
            ? extractFields(queryData.returnType)
            : {},
        };
      },
    );

    console.log("Extracted Root Queries:", queries);
    return queries;
  };


  extractRootQueries()