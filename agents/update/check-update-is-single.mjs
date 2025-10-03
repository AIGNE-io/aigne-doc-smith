export default async function checkUpdateIsSingle({ selectedDocs, ...rest }, options) {
  if (!selectedDocs || !Array.isArray(selectedDocs)) {
    throw new Error("selectedDocs must be provided as an array");
  }

  if (selectedDocs.length === 0) {
    throw new Error("selectedDocs cannot be empty");
  }

  let targetAgent;
  let agentName;

  if (selectedDocs.length === 1 && !rest.reset) {
    agentName = "updateSingleDocument";
    targetAgent = options.context.agents["updateSingleDocument"];
  } else {
    agentName = "batchUpdateDocument";
    targetAgent = options.context.agents["batchUpdateDocument"];
  }

  if (!targetAgent) {
    throw new Error(`Agent "${agentName}" is not available`);
  }

  try {
    const result = await options.context.invoke(targetAgent, {
      selectedDocs,
      ...rest,
    });

    return result;
  } catch (error) {
    console.error(`Error invoking ${agentName}:`, error.message);
    throw error;
  }
}

checkUpdateIsSingle.taskTitle = "Check document count and route to appropriate update agent";
