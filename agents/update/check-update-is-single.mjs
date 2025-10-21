export default async function checkUpdateIsSingle({ selectedDocs, ...rest }, options) {
  if (!selectedDocs || !Array.isArray(selectedDocs)) {
    throw new Error("A list of documents to update must be provided.");
  }

  if (selectedDocs.length === 0) {
    throw new Error("You must select at least one document to update.");
  }

  let targetAgent;
  let agentName;

  if (selectedDocs.length === 1 && !rest.reset) {
    // Single doc update without reset
    agentName = "updateSingleDocument";
    targetAgent = options.context.agents["updateSingleDocument"];
  } else {
    agentName = "batchUpdateDocument";
    targetAgent = options.context.agents["batchUpdateDocument"];
  }

  if (!targetAgent) {
    throw new Error(`Sorry, I can't seem to find the "${agentName}" agent.`);
  }

  try {
    const result = await options.context.invoke(targetAgent, {
      selectedDocs,
      ...rest,
    });

    return result;
  } catch (error) {
    console.error(
      `Sorry, I encountered an error while trying to run the ${agentName} agent:`,
      error.message,
    );
    throw error;
  }
}

checkUpdateIsSingle.taskTitle = "Check document count and route to appropriate update agent";
