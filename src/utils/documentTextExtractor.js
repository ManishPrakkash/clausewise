import Tesseract from 'tesseract.js';

class DocumentTextExtractor {
  /**
   * Extract text from various document formats
   * Supports: PDF, DOC, DOCX, TXT, and image files
   */
  async extractTextFromFile(file) {
    try {
      const fileType = this.getFileType(file);
      console.log(`Processing file: ${file.name}, Type: ${fileType}`);

      switch (fileType) {
        case 'pdf':
          return await this.extractTextFromPDF(file);
        case 'doc':
        case 'docx':
          return await this.extractTextFromWord(file);
        case 'txt':
          return await this.extractTextFromText(file);
        case 'image':
          return await this.extractTextFromImage(file);
        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }
    } catch (error) {
      console.error(`Error extracting text from ${file.name}:`, error);
      throw new Error(`Failed to extract text from ${file.name}: ${error.message}`);
    }
  }

  /**
   * Determine file type based on MIME type and extension
   */
  getFileType(file) {
    const mimeType = file.type.toLowerCase();
    const extension = file.name.split('.').pop().toLowerCase();

    if (mimeType.includes('pdf') || extension === 'pdf') {
      return 'pdf';
    } else if (mimeType.includes('word') || mimeType.includes('document') || 
               extension === 'doc' || extension === 'docx') {
      return extension === 'doc' ? 'doc' : 'docx';
    } else if (mimeType.includes('text/plain') || extension === 'txt') {
      return 'txt';
    } else if (mimeType.startsWith('image/')) {
      return 'image';
    } else {
      return 'unknown';
    }
  }

  /**
   * Extract text from PDF files
   * Note: This is a placeholder - you'll need to add a PDF parsing library
   */
  async extractTextFromPDF(file) {
    // For now, we'll use OCR on PDF as fallback
    // In production, you should use a proper PDF parsing library like pdf.js or pdf-parse
    console.log('PDF processing not yet implemented, using OCR fallback');
    return await this.extractTextFromImage(file);
    
    // TODO: Implement proper PDF text extraction
    // Example with pdf-parse library:
    // const arrayBuffer = await file.arrayBuffer();
    // const pdf = await pdfParse(arrayBuffer);
    // return pdf.text;
  }

  /**
   * Extract text from Word documents
   * Note: This is a placeholder - you'll need to add a Word parsing library
   */
  async extractTextFromWord(file) {
    // For now, we'll use OCR on Word documents as fallback
    // In production, you should use a proper Word parsing library like mammoth
    console.log('Word document processing not yet implemented, using OCR fallback');
    return await this.extractTextFromImage(file);
    
    // TODO: Implement proper Word document text extraction
    // Example with mammoth library:
    // const arrayBuffer = await file.arrayBuffer();
    // const result = await mammoth.extractRawText({ arrayBuffer });
    // return result.value;
  }

  /**
   * Extract text from plain text files
   */
  async extractTextFromText(file) {
    try {
      const text = await file.text();
      return text.trim();
    } catch (error) {
      console.error('Error reading text file:', error);
      throw new Error('Failed to read text file');
    }
  }

  /**
   * Extract text from image files using OCR
   */
  async extractTextFromImage(file) {
    try {
      console.log('Starting OCR extraction for image...');
      
      const result = await Tesseract.recognize(file, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      const extractedText = result.data.text.trim();
      console.log(`OCR completed. Extracted ${extractedText.length} characters`);
      
      return extractedText || 'No text detected in image';
    } catch (error) {
      console.error('OCR extraction failed:', error);
      throw new Error('Failed to extract text from image using OCR');
    }
  }

  /**
   * Process multiple files and extract text from each
   */
  async processMultipleFiles(files) {
    try {
      console.log(`Processing ${files.length} files...`);
      
      const results = await Promise.all(
        files.map(async (file) => {
          try {
            const text = await this.extractTextFromFile(file);
            return {
              name: file.name,
              type: this.getFileType(file),
              text: text,
              size: file.size,
              success: true
            };
          } catch (error) {
            console.error(`Failed to process ${file.name}:`, error);
            return {
              name: file.name,
              type: this.getFileType(file),
              text: '',
              size: file.size,
              success: false,
              error: error.message
            };
          }
        })
      );

      const successfulResults = results.filter(r => r.success);
      const failedResults = results.filter(r => !r.success);

      if (failedResults.length > 0) {
        console.warn(`${failedResults.length} files failed to process:`, failedResults);
      }

      return {
        results,
        successfulResults,
        failedResults,
        totalFiles: files.length,
        successCount: successfulResults.length,
        failureCount: failedResults.length
      };
    } catch (error) {
      console.error('Error processing multiple files:', error);
      throw new Error(`Failed to process files: ${error.message}`);
    }
  }

  /**
   * Get file size in human-readable format
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Validate file before processing
   */
  validateFile(file) {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const supportedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/tiff',
      'image/bmp'
    ];

    if (file.size > maxSize) {
      throw new Error(`File size (${this.formatFileSize(file.size)}) exceeds maximum allowed size (50MB)`);
    }

    if (!supportedTypes.includes(file.type)) {
      const extension = file.name.split('.').pop().toLowerCase();
      if (!['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'tiff', 'bmp'].includes(extension)) {
        throw new Error(`Unsupported file type: ${file.type || extension}`);
      }
    }

    return true;
  }

  /**
   * Get processing status for a file
   */
  getProcessingStatus(fileType) {
    const statusMessages = {
      'pdf': 'Extracting text from PDF...',
      'doc': 'Extracting text from Word document...',
      'docx': 'Extracting text from Word document...',
      'txt': 'Reading text file...',
      'image': 'Performing OCR on image...',
      'unknown': 'Processing file...'
    };

    return statusMessages[fileType] || 'Processing file...';
  }
}

export default new DocumentTextExtractor();
