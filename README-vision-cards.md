# Vision Cards System - Evidence-Based Astrological Analysis

## Overview

The Vision Cards System extends the existing cards-first astrology platform to accept **images and PDFs** for evidence-based analysis. This system creates **Evidence Cards** from visual inputs that serve as the source of truth for astrological interpretations, maintaining the same strict data-driven principles as the Prokerala cards.

## Architecture

### Core Principles

1. **Evidence Cards as Source of Truth**: Visual evidence is processed into structured cards
2. **Zero Hallucination Rule**: LLM can only use extracted evidence, no speculation
3. **Deterministic Extraction**: Same input always produces same evidence cards
4. **Multi-Modal Analysis**: Combines Prokerala data with visual evidence
5. **Language Support**: Full Nepali and English support throughout

### System Flow

```
Upload Files → Extract Evidence → Create Cards → LLM Analysis
     ↓              ↓              ↓           ↓
  Images/PDFs →  Vision Pipeline → Evidence → Combined
  (5 max, 20MB)   (Chin/Palm/Doc)  Cards    Analysis
```

## File Structure

```
lib/
├── extract/
│   ├── types.ts          # Evidence types and interfaces
│   ├── image.ts          # Image extraction pipeline
│   ├── pdf.ts            # PDF extraction pipeline
│   ├── ocr.ts            # OCR utilities
│   └── detection.ts      # Computer vision detection
├── uploads/
│   └── storage.ts        # File storage abstraction
├── llm/
│   └── prompt-vision.ts  # Vision-specific prompts
└── qa/
    └── extract.spec.ts   # Extraction tests

app/
├── api/uploads/route.ts  # File upload endpoint
├── api/extract/route.ts  # Evidence extraction endpoint
└── api/chat/route.ts     # Enhanced chat with evidence

components/
├── chat/
│   ├── UploadBar.tsx     # File upload interface
│   └── AttachmentChips.tsx # File preview chips
└── cards/
    └── EvidenceCards.tsx # Evidence display component

app/vision-cards/
└── page.tsx              # Test page for vision system
```

## Evidence Types

### Chin Analysis
```typescript
interface ChinObservation {
  jawAngleDeg?: number;              // Geometric analysis
  chinWidthPct?: number;             // Proportional width
  chinDepthPct?: number;             // Protrusion measurement
  dimpleLikely?: boolean;            // Dimple detection
  beardCoverage?: "none"|"light"|"heavy";
  lightingOk?: boolean;              // Quality assessment
  qualityNote?: string;              // Quality warnings
  confidence?: number;               // 0-1 confidence score
}
```

### Palm Reading
```typescript
interface PalmObservation {
  lineQuality: "low"|"medium"|"high";
  heartLineShape?: "straight"|"curved"|"forked"|"broken";
  headLineShape?: "straight"|"curved"|"forked"|"broken";
  lifeLineShape?: "long"|"short"|"chained"|"broken";
  fateLinePresent?: boolean;
  mountsStrong?: string[];           // e.g., ["Jupiter","Venus"]
  handednessGuess?: "left"|"right"|"unknown";
  qualityNote?: string;
  confidence?: number;               // 0-1 confidence score
}
```

### Document Analysis
```typescript
interface DocObservation {
  ocrText: string;                   // Extracted text
  pages: number;                     // Page count
  hasTables?: boolean;               // Table detection
  containsDates?: string[];          // Date extraction
  language?: string;                 // Language detection
  qualityNote?: string;              // Quality warnings
  confidence?: number;               // 0-1 confidence score
}
```

## Extraction Pipelines

### 1. Image Processing Pipeline

#### Chin Analysis
- **Face Detection**: Identifies facial features and landmarks
- **Jaw Angle Calculation**: Geometric analysis of jawline
- **Proportion Analysis**: Chin width and depth relative to face
- **Feature Detection**: Dimple and beard coverage analysis
- **Quality Assessment**: Lighting and angle evaluation

#### Palm Reading
- **Hand Detection**: Identifies palm orientation and keypoints
- **Line Detection**: Heart, head, life, and fate line analysis
- **Mount Analysis**: Planetary mount strength assessment
- **Quality Evaluation**: Line clarity and confidence scoring

#### Document Processing
- **Document Detection**: Identifies text regions and layout
- **OCR Extraction**: Text extraction with language detection
- **Date Extraction**: ISO date format detection
- **Table Detection**: Structured data identification

### 2. PDF Processing Pipeline

#### Text Extraction
- **PDF Parsing**: Direct text extraction from PDF structure
- **Image Conversion**: PDF pages to images for OCR fallback
- **Multi-page Support**: Handles documents up to 100 pages
- **Metadata Extraction**: Title, author, creation date

#### Quality Assessment
- **Scanned Document Detection**: Identifies image-based PDFs
- **Text Quality**: Confidence scoring for extracted content
- **Structure Analysis**: Table and form detection

### 3. OCR System

#### Multi-Provider Support
- **Tesseract.js**: Default OCR engine with language support
- **Google Vision**: Cloud-based OCR (configurable)
- **Azure Computer Vision**: Enterprise OCR (configurable)

#### Text Processing
- **Language Detection**: Automatic Nepali/English detection
- **Sensitive Data Redaction**: Email, phone, credit card removal
- **Date Extraction**: Multiple format support
- **Quality Normalization**: Whitespace and formatting cleanup

## API Endpoints

### File Upload (`/api/uploads`)
```typescript
POST /api/uploads
Content-Type: multipart/form-data

// Request
{
  files: File[],
  lang: "ne" | "en"
}

// Response
{
  success: boolean,
  files: FileRef[],
  errors?: string[]
}
```

### Evidence Extraction (`/api/extract`)
```typescript
POST /api/extract
Content-Type: application/json

// Request
{
  files: FileRef[],
  lang: "ne" | "en"
}

// Response
{
  success: boolean,
  bundle: EvidenceBundle,
  errors?: string[]
}
```

### Enhanced Chat (`/api/chat`)
```typescript
POST /api/chat
Content-Type: application/json

// Request
{
  question: string,
  lang: "ne" | "en",
  prokeralaData?: AstroData,
  evidenceBundle?: EvidenceBundle
}

// Response
{
  success: boolean,
  analysis: string,
  cardsUsed: {
    prokerala: boolean,
    evidence: boolean
  },
  warnings?: string[]
}
```

## UI Components

### UploadBar Component
- **Drag & Drop**: Intuitive file selection
- **File Validation**: Size, type, and count limits
- **Progress Indication**: Upload status and errors
- **Preview Thumbnails**: Visual file confirmation

### AttachmentChips Component
- **File Preview**: Icon, name, and size display
- **Quick Remove**: One-click file removal
- **Type Indicators**: Color-coded file types

### EvidenceCards Component
- **Structured Display**: Organized by evidence type
- **Quality Indicators**: Confidence and warning badges
- **Debug Mode**: Raw JSON inspection
- **Multi-language**: Full Nepali/English support

## Quality Assurance

### Extraction Tests
- **21 Test Cases**: Comprehensive pipeline coverage
- **Error Handling**: Graceful degradation testing
- **Language Support**: Nepali/English validation
- **Data Validation**: Type safety and range checking

### Test Coverage
- **Image Processing**: Chin, palm, document extraction
- **PDF Processing**: Text and metadata extraction
- **OCR Pipeline**: Text extraction and processing
- **Vision Detection**: Face, palm, document detection
- **End-to-End**: Complete workflow validation

## Performance Targets

### Upload Performance
- **File Size**: Up to 20MB per file
- **File Count**: Maximum 5 files per request
- **Upload Time**: < 2s for 5MB file (local storage)
- **Validation**: Real-time file type and size checking

### Extraction Performance
- **Image Processing**: < 1.5s per image
- **PDF Processing**: < 2.5s per page (including OCR)
- **OCR Processing**: < 1s per page
- **Total Pipeline**: < 5s for 5 files

### Memory Usage
- **File Storage**: Temporary local storage
- **Image Processing**: In-memory buffer handling
- **OCR Processing**: Worker-based processing
- **Cleanup**: Automatic temporary file removal

## Security & Privacy

### Data Protection
- **EXIF Stripping**: GPS and metadata removal
- **Sensitive Data Redaction**: Automatic PII removal
- **Temporary Storage**: Files deleted after processing
- **No Persistent Storage**: Evidence cards only

### Input Validation
- **File Type Validation**: Only image/PDF allowed
- **Size Limits**: 20MB per file, 5 files max
- **Malware Scanning**: Basic file validation
- **Content Filtering**: Inappropriate content detection

## Configuration

### Environment Variables
```bash
# Storage Configuration
UPLOAD_PROVIDER=local|s3
UPLOAD_PATH=/tmp/uploads
S3_BUCKET=zstro-uploads
S3_REGION=us-east-1

# OCR Configuration
OCR_PROVIDER=tesseract|google|azure
GOOGLE_VISION_API_KEY=your-key
AZURE_VISION_ENDPOINT=your-endpoint
AZURE_VISION_KEY=your-key

# Feature Flags
FEATURE_MEDIAPIPE=true|false
FEATURE_OPENCV=true|false
FEATURE_TFLITE=true|false
```

### Storage Providers

#### Local Storage (Development)
- **Path**: `/tmp/uploads` (configurable)
- **URLs**: `/_uploads/filename`
- **Cleanup**: Manual or scheduled

#### S3 Storage (Production)
- **Bucket**: Configurable S3 bucket
- **Region**: AWS region selection
- **URLs**: Presigned URLs for security
- **Cleanup**: Automatic lifecycle policies

## Usage Examples

### Basic Upload and Analysis
```typescript
// Upload files
const formData = new FormData();
files.forEach(file => formData.append('files', file));
formData.append('lang', 'ne');

const uploadResponse = await fetch('/api/uploads', {
  method: 'POST',
  body: formData
});
const { files } = await uploadResponse.json();

// Extract evidence
const extractResponse = await fetch('/api/extract', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ files, lang: 'ne' })
});
const { bundle } = await extractResponse.json();

// Analyze with evidence
const chatResponse = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    question: 'मेरो चिन र हातको रेखा विश्लेषण',
    lang: 'ne',
    evidenceBundle: bundle
  })
});
const { analysis } = await chatResponse.json();
```

### React Component Usage
```tsx
import UploadBar from '@/components/chat/UploadBar';
import EvidenceCards from '@/components/cards/EvidenceCards';

function VisionAnalysis() {
  const [files, setFiles] = useState([]);
  const [evidence, setEvidence] = useState(null);
  
  return (
    <div>
      <UploadBar
        onFilesUploaded={setFiles}
        lang="ne"
        maxFiles={5}
        maxSize={20}
      />
      {evidence && (
        <EvidenceCards
          bundle={evidence}
          showDebug={true}
        />
      )}
    </div>
  );
}
```

## Error Handling

### Upload Errors
- **File Too Large**: Clear size limit messaging
- **Invalid Type**: Supported format guidance
- **Too Many Files**: Count limit explanation
- **Network Issues**: Retry mechanism

### Extraction Errors
- **Low Quality Images**: Warning with recommendations
- **OCR Failures**: Fallback to manual input
- **PDF Parsing**: Error recovery strategies
- **Processing Timeouts**: Graceful degradation

### Analysis Errors
- **No Evidence**: Guidance for better inputs
- **Low Confidence**: Quality improvement suggestions
- **Language Mismatch**: Automatic detection and correction

## Future Enhancements

### Planned Features
- **Real-time Processing**: WebSocket-based updates
- **Batch Processing**: Multiple file processing
- **Advanced OCR**: Handwriting recognition
- **3D Analysis**: Depth perception for chin analysis
- **Video Support**: Frame-by-frame analysis

### Performance Improvements
- **Streaming Uploads**: Chunked file transfer
- **Parallel Processing**: Multi-file concurrent processing
- **Caching**: Evidence card caching
- **CDN Integration**: Global file distribution

### AI Enhancements
- **Custom Models**: Trained on astrological data
- **Confidence Scoring**: Improved accuracy metrics
- **Error Prediction**: Proactive quality assessment
- **Learning System**: Continuous improvement

## Contributing

### Development Setup
1. **Install Dependencies**: `npm install`
2. **Run Tests**: `npm run test:extract`
3. **Start Dev Server**: `npm run dev`
4. **Test Vision System**: Visit `/vision-cards`

### Code Standards
- **TypeScript Strict**: Full type safety
- **Test Coverage**: Comprehensive test suite
- **Error Handling**: Graceful degradation
- **Documentation**: Clear API documentation

### Testing Guidelines
- **Unit Tests**: Individual function testing
- **Integration Tests**: End-to-end workflow
- **Error Tests**: Failure scenario coverage
- **Performance Tests**: Response time validation

## Troubleshooting

### Common Issues

#### Upload Failures
- **Check file size**: Must be < 20MB
- **Verify file type**: Only JPG, PNG, WebP, PDF
- **Check network**: Ensure stable connection
- **Clear browser cache**: Remove old data

#### Extraction Issues
- **Image quality**: Use clear, well-lit images
- **File format**: Convert HEIC to JPEG
- **File size**: Compress large images
- **Angle**: Use frontal views for best results

#### Analysis Problems
- **Evidence quality**: Upload higher quality files
- **Language setting**: Match input language
- **Question clarity**: Be specific in questions
- **File count**: Use fewer, better quality files

### Debug Mode
Enable debug mode in EvidenceCards component to see:
- Raw extraction data
- Confidence scores
- Processing warnings
- Quality assessments

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or issues:
1. Check the test suite for examples
2. Review the API documentation
3. Examine the component source code
4. Create an issue with detailed information

---

**Remember**: The Vision Cards System maintains the same **source-of-truth** principles as the Prokerala cards. All analysis must be based on extracted evidence, with no speculation or external information. The evidence cards represent the definitive visual facts, and the LLM analysis must respect these boundaries.
