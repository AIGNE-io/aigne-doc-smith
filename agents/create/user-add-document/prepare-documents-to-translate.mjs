export default async function prepareDocumentsToTranslate(input, options) {
  const { documentsWithNewLinks = [] } = input;
  const documentsToTranslate = [];

  documentsWithNewLinks.forEach((doc) => {
    const content = options.context.userContext.currentContents[doc.path];

    if (content) {
      documentsToTranslate.push({
        ...doc,
        content,
      });
    } else {
      console.warn(`⚠️  Could not read content from userContext at path: ${doc.path}`);
    }
  });

  return {
    documentsToUpdate: [], // clear, reduce tokens consumption
    documentsToTranslate,
  };
}
