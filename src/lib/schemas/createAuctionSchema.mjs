const schema = {
    type: "object",
    properties: {
        body: {
            type: "object",
            properties: {
                title: {
                    type: "string",
                },
            },
            required: ["title"],
        },
    },
    required: ["body"], // required parameters (must be defined in the schema)
};

export default schema;
