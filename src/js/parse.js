function parse(xmlString) {
  const parser = new DOMParser();
  try {
    const document = parser.parseFromString(xmlString, 'text/xml');
    console.log('[Parse] Succesfuly parsed');
    return document;
  } catch (error) {
    console.log(`[Parse] Parsing error, invalid data: ${error.message}`);
    throw new Error(error.message, { cause: 'parseError' });
  }
}

export default parse;
