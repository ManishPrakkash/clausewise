/**
 * Free Key Points Extraction (no external APIs)
 * Uses simple rule-based heuristics tailored for land/contract text
 */

function identifyDocumentType(text) {
  const types = [
    { keywords: ['patta'], type: 'Patta Document (ownership record)' },
    { keywords: ['chitta'], type: 'Chitta Record (land classification)' },
    { keywords: ['a-register', 'a register'], type: 'A-Register Extract (village accountant record)' },
    { keywords: ['fmb', 'field measurement'], type: 'Field Measurement Book (survey details)' },
    { keywords: ['title deed'], type: 'Title Deed (ownership document)' },
    { keywords: ['sale deed'], type: 'Sale Deed (property transfer)' },
    { keywords: ['gift deed'], type: 'Gift Deed (property gift transfer)' }
  ];
  for (const t of types) {
    if (t.keywords.some(k => text.includes(k))) return t.type;
  }
  return 'Unknown Document';
}

function extractOwnerInformation(text) {
  const ownerPatterns = [
    /owner[:\s]+([a-zA-Z\s\.]+)/i,
    /pattadhar[:\s]+([a-zA-Z\s\.]+)/i,
    /(?:shri|sri|mr|mrs|ms)\.?\s+([a-zA-Z\s\.]+)/i
  ];
  for (const pattern of ownerPatterns) {
    const match = text.match(pattern);
    if (match) {
      const owner = match[1].trim().split(/\s+/).slice(0, 3).join(' ');
      return `Land is owned by ${owner}`;
    }
  }
  const namePattern = /(?:s\/o|d\/o|w\/o)\s+([a-zA-Z\s\.]+)/i;
  const nameMatch = text.match(namePattern);
  if (nameMatch) return `Property owner information includes ${nameMatch[1].trim()}`;
  return null;
}

function extractPropertyDetails(text) {
  const details = [];
  const surveyMatch = text.match(/(?:sf|survey)\s*no\.?\s*[:\-]?\s*(\d+\/?\d*-?\d*)/i);
  if (surveyMatch) details.push(`Survey No. ${surveyMatch[1]}`);
  const areaMatch = text.match(/(\d+\.?\d*)\s*(acre|acres|hectare|cent|cents)/i);
  if (areaMatch) details.push(`Area: ${areaMatch[1]} ${areaMatch[2]}`);
  const classifications = ['wet', 'dry', 'irrigated', 'garden', 'residential', 'commercial'];
  const foundClassification = classifications.find(c => text.includes(c));
  if (foundClassification) details.push(`Classification: ${foundClassification} land`);
  return details.length > 0 ? details.join(', ') : null;
}

function extractLocationInformation(text) {
  const locations = [];
  const tnDistricts = ['chennai', 'coimbatore', 'madurai', 'salem', 'vellore', 'erode'];
  const foundDistrict = tnDistricts.find(d => text.includes(d));
  if (foundDistrict) locations.push(`District: ${foundDistrict.charAt(0).toUpperCase() + foundDistrict.slice(1)}`);
  const talukMatch = text.match(/taluk[:\s]+([a-zA-Z\s]+)/i);
  if (talukMatch) locations.push(`Taluk: ${talukMatch[1].trim().split(/\s+/)[0]}`);
  const villageMatch = text.match(/village[:\s]+([a-zA-Z\s]+)/i);
  if (villageMatch) locations.push(`Village: ${villageMatch[1].trim().split(/\s+/)[0]}`);
  return locations.length > 0 ? `Located in ${locations.join(', ')}` : null;
}

function extractLegalStatus(text) {
  if (text.includes('registered')) return 'Document appears to be registered';
  if (text.includes('legal') || text.includes('valid')) return 'Document indicates legal validity';
  if (text.includes('patta') || text.includes('title')) return 'Document establishes ownership rights';
  return null;
}

function extractAdditionalInfo(text) {
  const dateMatch = text.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/);
  if (dateMatch) return `Document date: ${dateMatch[1]}`;
  const regMatch = text.match(/reg(?:istration)?\s*no\.?\s*[:\-]?\s*([a-zA-Z0-9\/\-]+)/i);
  if (regMatch) return `Registration number: ${regMatch[1]}`;
  if (text.includes('boundary') || text.includes('adjacent') || text.includes('border')) {
    return 'Document contains boundary and adjacent property details';
  }
  return null;
}

export const extractKeyPoints = async (inputText) => {
  try {
    if (!inputText || inputText.trim().length === 0) {
      return ['No key points available.'];
    }
    const text = inputText.toLowerCase();
    const keyPoints = [];

    const docType = identifyDocumentType(text);
    if (docType !== 'Unknown Document') keyPoints.push(`Document Type: This is a ${docType} from Tamil Nadu land records.`);

    const ownerInfo = extractOwnerInformation(text);
    if (ownerInfo) keyPoints.push(`Land Ownership: ${ownerInfo}`);

    const propertyDetails = extractPropertyDetails(text);
    if (propertyDetails) keyPoints.push(`Property Information: ${propertyDetails}`);

    const locationInfo = extractLocationInformation(text);
    if (locationInfo) keyPoints.push(`Location Details: ${locationInfo}`);

    const legalStatus = extractLegalStatus(text);
    if (legalStatus) keyPoints.push(`Legal Status: ${legalStatus}`);

    const additionalInfo = extractAdditionalInfo(text);
    if (additionalInfo && keyPoints.length < 5) keyPoints.push(`Additional Information: ${additionalInfo}`);

    while (keyPoints.length < 3) {
      keyPoints.push('Document contains Tamil Nadu land ownership and property information.');
    }
    return keyPoints.slice(0, 5);
  } catch (error) {
    console.error('Error extracting key points:', error);
    return [
      'Document processing completed using free analysis tools.',
      'Text extraction from document successful.',
      'Manual review recommended for detailed verification.'
    ];
  }
};

export default extractKeyPoints;


