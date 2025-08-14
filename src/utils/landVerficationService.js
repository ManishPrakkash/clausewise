// src/utils/landVerificationService.js

/**
 * Tamil Nadu Land Verification Service
 * Handles document processing and verification against TN Land Records
 */

class LandVerificationService {
  constructor() {
    this.baseURL = 'https://eservices.tn.gov.in';
    this.rateLimitDelay = 2000; // 2 seconds between requests
  }

  /**
   * Extract key information from uploaded land document using OCR
   */
  async extractDocumentData(file) {
    try {
      // This would integrate with your OCR service
      const formData = new FormData();
      formData.append('document', file);

      // Mock extraction for now
      const mockData = {
        documentType: 'Patta',
        surveyNumber: 'SF No. 123/4',
        district: 'Chennai',
        taluk: 'Tambaram', 
        village: 'Perungalathur',
        ownerName: 'Ramkumar',
        area: '2.5 acres',
        classification: 'Dry Land'
      };

      return mockData;
    } catch (error) {
      console.error('Error extracting document data:', error);
      throw new Error('Failed to extract document information');
    }
  }

  /**
   * Verify document against Tamil Nadu Land Records portal
   */
  async verifyWithPortal(documentData) {
    try {
      // Simulate API call with rate limiting
      await this.delay(this.rateLimitDelay);

      // Mock verification process
      const verificationResult = {
        registrationStatus: 'Registered',
        portalMatch: true,
        ownershipVerified: true,
        boundariesConfirmed: true,
        taxStatus: 'Current',
        lastUpdated: new Date().toISOString()
      };

      return verificationResult;
    } catch (error) {
      console.error('Error verifying with portal:', error);
      throw new Error('Portal verification failed');
    }
  }

  /**
   * Determine ownership type (Government vs Private)
   */
  async checkOwnershipType(documentData) {
    try {
      // Check against Poramboke (government land) records
      const isGovernmentLand = await this.checkPorambokeLand(documentData);
      
      return {
        type: isGovernmentLand ? 'Government' : 'Private',
        verified: true,
        details: isGovernmentLand ? 'Poramboke (Government) Land' : 'Private Ownership'
      };
    } catch (error) {
      console.error('Error checking ownership type:', error);
      return {
        type: 'Unknown',
        verified: false,
        details: 'Could not verify ownership type'
      };
    }
  }

  /**
   * Check if land is Poramboke (government land)
   */
  async checkPorambokeLand(documentData) {
    // Mock check - in reality this would query the Poramboke records
    const governmentSurveyNumbers = ['SF No. 999/1', 'SF No. 888/2'];
    return governmentSurveyNumbers.includes(documentData.surveyNumber);
  }

  /**
   * Generate comprehensive verification report
   */
  async generateReport(documentData, verificationResults, ownershipInfo) {
    const discrepancies = this.findDiscrepancies(documentData, verificationResults);
    
    const report = {
      id: Date.now().toString(),
      documentName: documentData.fileName || 'Land Document',
      uploadDate: new Date().toLocaleDateString(),
      status: discrepancies.length === 0 ? 'Verified' : 'Issues Found',
      isLegal: discrepancies.length === 0,
      ownershipType: ownershipInfo.type,
      documentType: documentData.documentType,
      surveyNumber: documentData.surveyNumber,
      district: documentData.district,
      taluk: documentData.taluk,
      village: documentData.village,
      area: documentData.area,
      owner: documentData.ownerName,
      discrepancies: discrepancies,
      confidence: this.calculateConfidence(verificationResults, discrepancies),
      verificationDetails: verificationResults
    };

    return report;
  }

  /**
   * Find discrepancies between document and portal data
   */
  findDiscrepancies(documentData, portalData) {
    const discrepancies = [];

    if (!portalData.portalMatch) {
      discrepancies.push('Document details do not match portal records');
    }

    if (!portalData.ownershipVerified) {
      discrepancies.push('Ownership information could not be verified');
    }

    if (portalData.taxStatus !== 'Current') {
      discrepancies.push('Tax payments are not current');
    }

    return discrepancies;
  }

  /**
   * Calculate confidence score based on verification results
   */
  calculateConfidence(verificationResults, discrepancies) {
    let score = 100;
    
    // Deduct points for each failed verification
    if (!verificationResults.registrationStatus) score -= 20;
    if (!verificationResults.portalMatch) score -= 25;
    if (!verificationResults.ownershipVerified) score -= 20;
    if (!verificationResults.boundariesConfirmed) score -= 15;
    if (verificationResults.taxStatus !== 'Current') score -= 10;

    // Additional deduction for discrepancies
    score -= discrepancies.length * 5;

    return Math.max(score, 0);
  }

  /**
   * Utility function for rate limiting
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Main verification workflow
   */
  async processLandDocument(file) {
    try {
      // Step 1: Extract document data
      const documentData = await this.extractDocumentData(file);
      documentData.fileName = file.name;

      // Step 2: Verify with portal
      const verificationResults = await this.verifyWithPortal(documentData);

      // Step 3: Check ownership type
      const ownershipInfo = await this.checkOwnershipType(documentData);

      // Step 4: Generate comprehensive report
      const report = await this.generateReport(documentData, verificationResults, ownershipInfo);

      return report;
    } catch (error) {
      console.error('Error processing land document:', error);
      throw error;
    }
  }
}

export default new LandVerificationService();
