export default async function prepareDocumentsToTranslate(input, options) {
  const { documentsWithInvalidLinks = [] } = input;
  const documentsToTranslate = [];

  documentsWithInvalidLinks.forEach((doc) => {
    const content = options.context.userContext.currentContents[doc.path];

    if (content) {
      documentsToTranslate.push({
        ...doc,
        content,
      });
    } else {
      console.warn(`⚠️  Could not find content from userContext at path: ${doc.path}`);
    }
  });

  return {
    documentsToUpdate: [], // clear, reduce token consumption
    documentsToTranslate,
  };
}
