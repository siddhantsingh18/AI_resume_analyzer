const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Groq = require('groq-sdk');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle, ShadingType, TableRow,
  TableCell, Table, WidthType, convertInchesToTwip
} = require('docx');
const { protect } = require('../middleware/auth');
const Analysis = require('../models/Analysis');

const router = express.Router();
const getGroq = () => new Groq({ apiKey: process.env.GROQ_API_KEY });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = ['application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'].includes(file.mimetype);
    ok ? cb(null, true) : cb(new Error('Only PDF and DOCX files are allowed'));
  }
});

async function extractText(buffer, mimetype) {
  if (mimetype === 'application/pdf') {
    const data = await pdfParse(buffer);
    return data.text;
  }
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

async function analyzeWithGroq(resumeText, jobDescription) {
  const prompt = `You are an expert resume analyst and career coach. Carefully analyze the resume against the job description.

RESUME:
${resumeText.slice(0, 3000)}

JOB DESCRIPTION:
${jobDescription.slice(0, 2000)}

Return ONLY a valid JSON object — no markdown, no backticks, no explanation. Use exactly this schema:
{
  "matchScore": <integer 0-100>,
  "isFit": <true if matchScore >= 65>,
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength1>","<strength2>","<strength3>"],
  "weaknesses": ["<weakness1>","<weakness2>","<weakness3>"],
  "suggestions": ["<suggestion1>","<suggestion2>","<suggestion3>","<suggestion4>"],
  "matchedKeywords": ["<kw1>","<kw2>","<kw3>","<kw4>","<kw5>"],
  "missingKeywords": ["<kw1>","<kw2>","<kw3>","<kw4>","<kw5>"],
  "updatedResume": "<Complete rewritten resume text that is ATS-optimized, incorporates missing keywords naturally, highlights relevant skills, and is formatted professionally. Include all standard sections: Summary, Skills, Experience, Education.>"
}`;

  const completion = await getGroq().chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 4096
  });

  const text = completion.choices[0]?.message?.content || '';
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

/**
 * Converts a plain-text resume into a styled .docx Buffer.
 * Recognises common section headers (ALL-CAPS or Title Case lines ending with colon)
 * and formats them as Heading 2. Everything else is a normal paragraph.
 */
async function buildDocxBuffer(resumeText, candidateName) {
  const lines = resumeText.split('\n');
  const SECTION_HEADERS = /^(SUMMARY|OBJECTIVE|SKILLS|TECHNICAL SKILLS|EXPERIENCE|WORK EXPERIENCE|EDUCATION|CERTIFICATIONS|PROJECTS|AWARDS|LANGUAGES|REFERENCES|CONTACT|PROFILE)[\s:]*$/i;

  const children = [];

  // ── Title / Name ──────────────────────────────────────────────────────────
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: candidateName || 'AI-Optimized Resume',
          bold: true,
          size: 36,          // 18 pt
          color: '4F46E5',   // indigo brand colour
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 }
    })
  );

  // Thin horizontal rule under name
  children.push(
    new Paragraph({
      border: {
        bottom: { color: '4F46E5', space: 1, style: BorderStyle.SINGLE, size: 6 }
      },
      spacing: { after: 200 }
    })
  );

  // ── Body lines ────────────────────────────────────────────────────────────
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      children.push(new Paragraph({ spacing: { after: 60 } }));
      continue;
    }

    if (SECTION_HEADERS.test(line)) {
      // Section heading
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [
            new TextRun({
              text: line.replace(/:$/, '').toUpperCase(),
              bold: true,
              size: 26,      // 13 pt
              color: '4F46E5',
            })
          ],
          border: {
            bottom: { color: 'C7D2FE', space: 1, style: BorderStyle.SINGLE, size: 4 }
          },
          spacing: { before: 200, after: 80 }
        })
      );
    } else if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
      // Bullet point
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          children: [
            new TextRun({
              text: line.replace(/^[•\-\*]\s*/, ''),
              size: 22,      // 11 pt
            })
          ],
          spacing: { after: 40 }
        })
      );
    } else {
      // Regular paragraph
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              size: 22,      // 11 pt
            })
          ],
          spacing: { after: 60 }
        })
      );
    }
  }

  // ── Footer note ───────────────────────────────────────────────────────────
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Generated by ResumeAI — AI-Optimized for ATS',
          size: 16,
          color: '9CA3AF',
          italics: true,
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 }
    })
  );

  const doc = new Document({
    creator: 'ResumeAI',
    title: 'AI-Optimized Resume',
    description: 'Resume optimized by ResumeAI for ATS compliance',
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(0.8),
            right: convertInchesToTwip(0.9),
            bottom: convertInchesToTwip(0.8),
            left: convertInchesToTwip(0.9),
          }
        }
      },
      children
    }]
  });

  return Packer.toBuffer(doc);
}

// ── POST /api/analyze ─────────────────────────────────────────────────────
router.post('/', protect, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Please upload a resume file (PDF or DOCX)' });
    const { jobDescription } = req.body;
    if (!jobDescription || jobDescription.trim().length < 30)
      return res.status(400).json({ error: 'Please provide a detailed job description' });

    const resumeText = await extractText(req.file.buffer, req.file.mimetype);
    if (!resumeText || resumeText.trim().length < 50)
      return res.status(400).json({ error: 'Could not extract text from resume. Ensure it is not a scanned image.' });

    const result = await analyzeWithGroq(resumeText, jobDescription);

    const saved = await Analysis.create({
      userId: req.user._id,
      resumeText: resumeText.slice(0, 5000),
      jobDescription: jobDescription.slice(0, 2000),
      fileName: req.file.originalname,
      matchScore: result.matchScore,
      isFit: result.isFit,
      summary: result.summary,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      suggestions: result.suggestions,
      updatedResume: result.updatedResume,
      missingKeywords: result.missingKeywords,
      matchedKeywords: result.matchedKeywords
    });

    res.json({
      success: true,
      analysis: {
        id: saved._id,
        fileName: req.file.originalname,
        matchScore: result.matchScore,
        isFit: result.isFit,
        summary: result.summary,
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        suggestions: result.suggestions,
        matchedKeywords: result.matchedKeywords,
        missingKeywords: result.missingKeywords,
        updatedResume: result.updatedResume,
        createdAt: saved.createdAt
      }
    });
  } catch (e) {
    console.error('Analysis error:', e.message);
    if (e.message.includes('Only PDF')) return res.status(400).json({ error: e.message });
    res.status(500).json({ error: 'Analysis failed. Please try again.' });
  }
});

// ── GET /api/analyze/download-docx/:id ────────────────────────────────────
// Generates and streams a .docx file for the AI-optimised resume of a saved analysis
router.get('/download-docx/:id', protect, async (req, res) => {
  try {
    const analysis = await Analysis.findOne({ _id: req.params.id, userId: req.user._id });
    if (!analysis) return res.status(404).json({ error: 'Analysis not found' });
    if (!analysis.updatedResume) return res.status(400).json({ error: 'No optimized resume available' });

    const buffer = await buildDocxBuffer(analysis.updatedResume, req.user.name);
    const safeName = analysis.fileName
      ? analysis.fileName.replace(/\.[^/.]+$/, '') + '-optimized.docx'
      : 'optimized-resume.docx';

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
    res.send(buffer);
  } catch (e) {
    console.error('DOCX generation error:', e.message);
    res.status(500).json({ error: 'Failed to generate DOCX file.' });
  }
});

// ── GET /api/analyze/history ──────────────────────────────────────────────
router.get('/history', protect, async (req, res) => {
  try {
    const analyses = await Analysis.find({ userId: req.user._id })
      .select('-resumeText -updatedResume')
      .sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, analyses });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── GET /api/analyze/:id ──────────────────────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const analysis = await Analysis.findOne({ _id: req.params.id, userId: req.user._id });
    if (!analysis) return res.status(404).json({ error: 'Analysis not found' });
    res.json({ success: true, analysis });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
